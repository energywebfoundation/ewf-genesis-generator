#!/usr/bin/env node

// include dependencies
const fs = require('fs');
const getJSON = require('get-json');
const fsExtra = require('fs-extra');
const async = require('async');
const Web3 = require('web3');
const ganache = require("ganache-core");

// parse argument variables
const args = require('minimist')(process.argv.slice(2));

// argument variable settings
const CONTRACTS_PATH = args['p'];
const MULTISIG_PATH = args['m'];
const BUILD_PATH = args['b'];

// internal settings
const SPEC_NAME = '/build/chainspec/Volta';

// default contract config
const VALIDATOR_RELAY = '0x1204700000000000000000000000000000000000';
const VALIDATOR_RELAYED = '0x1204700000000000000000000000000000000001';
const REWARD = '0x1204700000000000000000000000000000000002';
const COMMUNITY_FUND = '0x1204700000000000000000000000000000000003';
const VESTING = '0x1204700000000000000000000000000000000004';
const VALIDATOR_NETOPS = '0x1204700000000000000000000000000000000005';
const TARGET_AMOUNT = '80000000000000000000000';

var DEFAULT_CONTRACT_CONFIGS = [
    {
        address: VALIDATOR_RELAYED,
        name: 'ValidatorSetRelayed',
        description: 'Validator Set Relayed',
        params: [
            VALIDATOR_RELAY,
            [
                // this is the list of initial validators
                "0x7e8b8661dbc77d6bee7a1892fbcf8ef6378cab30",
                "0xdae561c716f9ea58e32e37d9ae95465eca286012",
                "0xebee2fc556975c3dd50c17d13a15af535fb7bbb3"
            ]
        ],
        params_types: ['address', 'address[]']
    },
    {        
        address: VALIDATOR_RELAY,
        name: 'ValidatorSetRelay',
        description: 'Validator Set Relay',
        params: [
            VALIDATOR_RELAYED
        ],
        params_types: ['address']
    },
    {
        address: REWARD,
        name: 'BlockReward',
        description: 'Block Reward',
        balance: TARGET_AMOUNT,
        params: [
            COMMUNITY_FUND,
            '0'
        ],
        params_types: ['address', 'uint']
    },
    {
        address: VESTING,
        name: 'Holding',
        description: 'Vesting Contract',
        params: [],
        params_types: []
    }

];

var DEFAULT_MULTISIG_CONFIGS = [
    {        
        address: VALIDATOR_NETOPS,
        name: 'MultiSigWallet',
        description: 'Wallet of the Netops team',
        params: [
            // list of netops addresses
            ['0x0650231bd8ebb81af7aeeee52e322eeb28fea5b9'],
            '1'
        ],
        params_types: ['address[]', 'uint']
    },
    {        
        address: COMMUNITY_FUND,
        name: 'MultiSigWallet',
        description: 'Wallet of the Community Fund',
        params: [
            // list of foundation addresses
            ['0x0650231bd8ebb81af7aeeee52e322eeb28fea5b9'],
            '1'
        ],
        params_types: ['address[]', 'uint']
    }
]

var web3 = new Web3(ganache.provider());

var chainspec = {};

// main
async.waterfall([
    deletePreviousVersion,
    retrieveChainspec,
    addPoaParams,
    addMultiSigs,
    retrieveContractsBytecode
], function (err, result) {
    let data = JSON.stringify(chainspec, null, 4);
    var buildPath = '';
    if (BUILD_PATH){
        buildPath = BUILD_PATH;
    } else {
        buildPath = process.cwd() + SPEC_NAME + '.json';
    }
    if (buildPath != '') {
        fsExtra.outputFile(buildPath, data, err => {
            if (!err) {
                console.log('*** Chain Spec file generated successfully at ' + process.cwd() + SPEC_NAME + '.json'  + ' ***');
            }
        });
    }    
});


function retrieveChainspec(callback) {
    console.log('-***-###-@@@-&&&-- EWF Genesis ChianSpec Generator --***-###-@@@-&&&--');
    // retrieving the local sample chainspec file
    fs.readFile(process.cwd() + '/sample_chainspc/Volta.json', (err, genesisJson) => {  
        if (err) throw err;
        chainspec = JSON.parse(genesisJson);                        
        callback(null);
    });
}


// adds multisig contracts
function addMultiSigs(callback) {
    console.log('## adding multi sig contracts ##');

    if (MULTISIG_PATH != undefined){
        async.each(DEFAULT_MULTISIG_CONFIGS, function(contractConfig, callback) { 
            fs.readFile(MULTISIG_PATH + '/' + contractConfig.name + '.json', (err, contractJson) => {
                if (err) throw err;
    
                let _constructor = encodeParamToByteCode(JSON.parse(contractJson).bytecode, contractConfig.params_types, contractConfig.params);
                let _balance;
                if (typeof contractConfig.balance !== 'undefined')
                    _balance = contractConfig.balance;
                else
                    _balance = 1;

                chainspec.accounts[contractConfig.address] = {
                    balance: _balance,
                    constructor: _constructor
                };
                callback(null);
            });
        }, function(err) {
            if (!err){
                callback(null);
            }
        });
    }

}


// adds system contracts
function retrieveContractsBytecode(callback) {   
    console.log('## retrieving system contracts bytecodes ##');

    if (CONTRACTS_PATH != undefined){
        async.eachSeries(DEFAULT_CONTRACT_CONFIGS, function(contractConfig, callback) {        
            // retrieving the compiled contract bytecode
            fs.readFile(CONTRACTS_PATH + '/' + contractConfig.name + '.json', (err, contractJson) => {
                if (err) throw err;
                
                console.log("Adding " + contractConfig.description)
                let _constructor = encodeParamToByteCode(JSON.parse(contractJson).bytecode, contractConfig.params_types, contractConfig.params);
                let _balance;
                if (typeof contractConfig.balance !== 'undefined')
                    _balance = contractConfig.balance;
                else
                    _balance = 1;
                
                chainspec.accounts[contractConfig.address] = {
                    balance: _balance,
                    constructor: _constructor
                };
                callback(null);
            });        
            }, function(err) {
            if (!err){
                callback(null);
            }
        });
    } else {
        console.log("Compiled built contract path no defined, usage: --p <YOUR_COMPILED_CONTRACT_PATH>");
    }
}


function addPoaParams(callback) {
    // link validators set
    chainspec.engine.authorityRound.params["validators"] = {
        contract: VALIDATOR_RELAY
    };
    // link reward contract
    chainspec.engine.authorityRound.params["blockRewardContractAddress"] = REWARD;
    chainspec.engine.authorityRound.params["blockRewardContractTransition"] = "0";
    callback(null);
}


function encodeParamToByteCode(bytecode, parameterTypes, parameterValues) {
    if (parameterTypes.length !== parameterValues.length)
      throw "types and values do not match"
    //encode the parameters
    parameters = web3.eth.abi.encodeParameters(parameterTypes, parameterValues);
    //merge bytecode and parameters
    return bytecode.concat(parameters.slice(2))
}


function deletePreviousVersion(callback) {
    var buildPath = '';
    if (BUILD_PATH){
        buildPath = BUILD_PATH;
    } else {
        buildPath = process.cwd() + SPEC_NAME + '.json';
    }
    if (buildPath != ''){
        fs.unlink(buildPath, (err) => {
            if (!err) 
                console.log(buildPath + ' was deleted');
        });
    }
    callback(null)
}
