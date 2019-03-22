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

// default settings
const USING_LOCAL_CHAINSPEC = true;

// argument variable settings
const CONTRACTS_PATH = args['p'];
const SINGLE_CONTRACT = (args['cn'] != undefined);
const SINGLE_CONTRACT_NAME = args['cn'];
const SINGLE_CONTRACT_ADDRESS = args['ca'];
const BUILD_PATH = args['b'];

// default sample contract config
var DEFAULT_CONTRACT_CONFIGS = [
    {        
        address: '0x1204700000000000000000000000000000000000',
        name: 'ValidatorSetRelay',
        description: 'Validator Set Relay',
        params: '0x1204700000000000000000000000000000000001'
    },
    {
        address: '0x1204700000000000000000000000000000000001',
        name: 'ValidatorSetRelayed',
        description: 'Validator Set Relayed',
        params: [
            '0x1204700000000000000000000000000000000000',
            [
            "0x7e8b8661dbc77d6bee7a1892fbcf8ef6378cab30",
            "0xdae561c716f9ea58e32e37d9ae95465eca286012",
            "0xebee2fc556975c3dd50c17d13a15af535fb7bbb3"
            ]
        ]
    }
];
var DEFAULT_CONTRACT_CONFIGS = [
    {        
        address: '0x1204700000000000000000000000000000000000',
        name: 'ValidatorSetRelay',
        description: 'Validator Set Relay',
        params: '0x1204700000000000000000000000000000000001'
    }]
var EWF_ADDRESS = '0x069feF24235d0A08c6D06428D8131CCda89b2117';

var web3 = new Web3(ganache.provider());

var chainspec = {};

async.waterfall([
    retrieveChainspec,
    addDeployer,
    retrieveContractsBytecode
], function (err, result) {
    let data = JSON.stringify(chainspec, null, 4);
    var buildPath = '';
    if (BUILD_PATH){
        buildPath = BUILD_PATH;
    }else{
        buildPath = process.cwd() + '/build/chainspec/Volta.json';
    }
    if (buildPath != ''){
        fsExtra.outputFile(buildPath, data, err => {
            if (!err){
                console.log('*** Chain Spec file generated successfully at ' + process.cwd() + '/build/chainspec/Volta.json'  + ' ***');
            }
        });
    }    
});

function retrieveChainspec(callback) {
    console.log('-***-###-@@@-&&&-- EWF Genesis ChianSpec Generator --***-###-@@@-&&&--');
    console.log('## retrieving initial chainspec file ##');
    // retrieving the local sample chainspec file
    fs.readFile(process.cwd() + '/sample_chainspc/Volta.json', (err, genesisJson) => {  
        if (err) throw err;
        chainspec = JSON.parse(genesisJson);                        
        callback(null);
    });
}

function retrieveContractsBytecode(callback) {   
    console.log('## retrieving specifid contracts bytecodes ##');

    if (SINGLE_CONTRACT){
        // retrieving the compiled contract bytecode
        fs.readFile(CONTRACTS_PATH + '/' + SINGLE_CONTRACT_NAME + '.json', (err, contractJson) => {  
            if (err) throw err;            
            chainspec.accounts[SINGLE_CONTRACT_ADDRESS] = {
                balance: '1',
                constructor: JSON.parse(contractJson).bytecode
            };            
            callback(null);
        });
    } else{
        if (CONTRACTS_PATH != undefined){
            async.each(DEFAULT_CONTRACT_CONFIGS, function(contractConfig, callback) {        
                // retrieving the compiled contract bytecode
                fs.readFile(CONTRACTS_PATH + '/' + contractConfig.name + '.json', (err, contractJson) => {  
                    if (err) throw err;
                    // encode ABI
                    const myContract = new web3.eth.Contract([contractJson], '0x1204700000000000000000000000000000000001', {
                        from: EWF_ADDRESS, // default from address
                        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
                    });

                    // Simply encoding
                    myContract.deploy({
                        data: JSON.parse(contractJson).bytecode,
                        arguments: [contractConfig.params]
                    })
                    .encodeABI();

                    chainspec.accounts[contractConfig.address] = {
                        balance: '1',
                        constructor: myContract
                    };            
                    callback(null);
                });        
              }, function(err) {
                if (!err){
                    callback(null);
                }
            });
        }else{
            console.log("Compiled built contract path no defined, usage: --p <YOUR_COMPILED_CONTRACT_PATH>");
        }  
    }
}

function addDeployer(callback) {
    chainspec.accounts[EWF_ADDRESS] = {
        balance: '1000000000000000' // !!!
    };
    callback(null);
}
