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
const SPEC_NAME = 'volta';

// default contract config
let VALIDATOR_RELAY;
let VALIDATOR_RELAYED;
let REWARD;
let COMMUNITY_FUND;
let VESTING;
let VALIDATOR_NETOPS;
let TARGET_AMOUNT;
let DEFAULT_CONTRACT_CONFIGS;
let DEFAULT_MULTISIG_CONFIGS;
let REGISTRY;

const web3 = new Web3(ganache.provider());

let chainspec = {};
let values = {};

// main
async.waterfall([
    retrieveChainspec,
    retrieveValues,
    addPoaParams,
    addMultiSigs,
    addEWAG,
    addRegistry,
    retrieveContractsBytecode
], function (err, result) {
    let data = JSON.stringify(chainspec, null, 4);
    var buildPath = '';
    if (BUILD_PATH){
        buildPath = BUILD_PATH;
    } else {
        buildPath = process.cwd() + '/build/chainspec/' + SPEC_NAME + '.json';
    }
    if (buildPath != '') {
        fsExtra.outputFile(buildPath + '/Volta.json', data, err => {
            if (!err) {
                console.log('*** Chain Spec file generated successfully at ' + buildPath + ' ***');
            }
        });
    }    
});

// retrieves a very basic (hardcoded) chainspec
function retrieveChainspec(callback) {
    console.log('-***-###-@@@-&&&-- EWF Genesis ChianSpec Generator --***-###-@@@-&&&--');
    // retrieving the local sample chainspec file
    fs.readFile(process.cwd() + '/sample_chainspec/' + SPEC_NAME + '.json', (err, genesisJson) => {  
        if (err) throw err;
        chainspec = JSON.parse(genesisJson);                        
        callback(null);
    });
}

// retrieves the addresses and parameters
function retrieveValues(callback) {
    console.log('-***-###-@@@-&&&-- EWF Genesis ChianSpec Generator --***-###-@@@-&&&--');
    // retrieving the local sample chainspec file
    fs.readFile(process.cwd() + '/sample_chainspec/hardcoded_values.json', (err, jso) => {  
        if (err) throw err;
        values = JSON.parse(jso);
        
        VALIDATOR_RELAY = values.address_book["VALIDATOR_RELAY"];
        VALIDATOR_RELAYED = values.address_book["VALIDATOR_RELAYED"];
        REWARD = values.address_book["REWARD"];
        COMMUNITY_FUND = values.address_book["COMMUNITY_FUND"];
        VESTING = values.address_book["VESTING"];
        VALIDATOR_NETOPS = values.address_book["VALIDATOR_NETOPS"];
        TARGET_AMOUNT = values.balances["TARGET_AMOUNT"];
        COMMUNITY_REWARD = values.balances["COMMUNITY_REWARD"];
        REGISTRY = values.address_book["REGISTRY"];
        NODECONTROL_LOOKUP = values.address_book["NODECONTROL_LOOKUP"];
        NODECONTROL_DB = values.address_book["NODECONTROL_DB"];
        NODECONTROL_SIMPLE = values.address_book["NODECONTROL_SIMPLE"];

        DEFAULT_CONTRACT_CONFIGS = [
            {
                address: VALIDATOR_RELAYED,
                name: 'ValidatorSetRelayed',
                description: 'Validator Set Relayed',
                params: [
                    VALIDATOR_NETOPS,
                    VALIDATOR_RELAY,
                    values.address_book["INITAL_VALIDATORS"]
                ],
                params_types: ['address', 'address', 'address[]']
            },
            {        
                address: VALIDATOR_RELAY,
                name: 'ValidatorSetRelay',
                description: 'Validator Set Relay',
                params: [
                    VALIDATOR_NETOPS,
                    VALIDATOR_RELAYED
                ],
                params_types: ['address', 'address']
            },
            {
                address: REWARD,
                name: 'BlockReward',
                description: 'Block Reward',
                balance: TARGET_AMOUNT,
                params: [
                    COMMUNITY_FUND,
                    COMMUNITY_REWARD
                ],
                params_types: ['address', 'uint']
            },
            {
                address: VESTING,
                name: 'Holding',
                description: 'Vesting Contract',
                params: [],
                params_types: []
            },
            {
                address: REGISTRY,
                name: 'SimpleRegistry',
                description: 'Registrar',
                params: [
                    VALIDATOR_NETOPS
                ],
                params_types: ['address']
            },
            {
                address: NODECONTROL_LOOKUP,
                name: 'NodeControlLookUp',
                description: 'NodeControlLookUp',
                params: [
                    NODECONTROL_SIMPLE,
                    VALIDATOR_NETOPS
                ],
                params_types: ['address', 'address']               
            },
            {
                address: NODECONTROL_DB,
                name: 'NodeControlDb',
                description: 'NodeControlDb',
                params: [
                    NODECONTROL_LOOKUP,
                    VALIDATOR_NETOPS
                ],
                params_types: ['address', 'address']               
            },  
            {
                address: NODECONTROL_SIMPLE,
                name: 'NodeControlSimple',
                description: 'NodeControlSimple',
                params: [
                    NODECONTROL_DB,
                    VALIDATOR_NETOPS
                ],
                params_types: ['address', 'address']               
            }
        
        ];
        
        DEFAULT_MULTISIG_CONFIGS = [
            {        
                address: VALIDATOR_NETOPS,
                name: 'MultiSigWalletFactory',
                description: 'Wallet of the Netops team',
                params: [
                    values.address_book["NETOPS_MEMBERS"],
                    values.multisig_required["NETOPS"]
                ],
                params_types: ['address[]', 'uint']
            },
            {        
                address: COMMUNITY_FUND,
                name: 'MultiSigWallet',
                description: 'Wallet of the Community Fund',
                params: [
                    values.address_book["COMMUNITY_FUND_MEMBERS"],
                    values.multisig_required["COMMUNITY_FUND"]
                ],
                params_types: ['address[]', 'uint']
            }
        ];
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
                let _constructor = encodeParamToByteCode(JSON.parse(contractJson).bytecode, contractConfig);
                let _balance;
                if (typeof contractConfig.balance !== 'undefined')
                    _balance = contractConfig.balance;
                else
                    _balance = "1";

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
                let _constructor = encodeParamToByteCode(JSON.parse(contractJson).bytecode, contractConfig);
                let _balance;
                if (typeof contractConfig.balance !== 'undefined')
                    _balance = contractConfig.balance;
                else
                    _balance = "1";
                
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

// modifies the Aura parameters
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

// adds EWAG account
function addEWAG(callback) {
    console.log("EWAG")
    chainspec.accounts[values.address_book["EWAG"]] = {
        balance: values.balances["EWAG"]
    };
    callback(null);
}

// adds registry
function addRegistry(callback) {
    console.log("Registry")
    chainspec.params["registrar"] = values.address_book["REGISTRY"];
    callback(null);
}

// prepares the bytecode of the contracts
function encodeParamToByteCode(bytecode, contractConf) {
    if (contractConf.params_types.length !== contractConf.params.length)
      throw contractConf.name + " types and values do not match"
    //encode the parameters
    parameters = web3.eth.abi.encodeParameters(contractConf.params_types, contractConf.params);
    //merge bytecode and parameters
    console.log("bytecode", bytecode)
    return bytecode.concat(parameters.slice(2))
}

