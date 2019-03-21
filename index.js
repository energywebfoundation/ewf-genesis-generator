#!/usr/bin/env node

// include dependencies
const fs = require('fs');
const getJSON = require('get-json');
const fsExtra = require('fs-extra');
const async = require('async');

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
        address: '0x1000000000000000000000000000000000000005',
        name: 'ValidatorFoo',
        description: 'Validators contract'
    },
    {
        address: '0x1000000000000000000000000000000000000006',
        name: 'VestingFoo',
        description: 'Vesting contract 1'
    },
    {
        address: '0x1000000000000000000000000000000000000007',
        name: 'SetX',
        description: 'Vesting contract 2'
    },
    {
        address: '0x1000000000000000000000000000000000000008',
        name: 'RewardFoo',
        description: 'Block reward contract'
    }
];

var chainspec = {};

async.waterfall([
    retrieveChainspec,
    retrieveContractsBytecode
], function (err, result) {
    let data = JSON.stringify(chainspec, null, 4);
    var buildPath = '';
    if (BUILD_PATH){
        buildPath = BUILD_PATH;
    }else{
        buildPath = process.cwd() + '/build/chainspec/Genome.json';
    }
    if (buildPath != ''){
        fsExtra.outputFile(buildPath, data, err => {
            if (!err){
                console.log('*** Chain Spec file generated successfully at ' + process.cwd() + '/build/chainspec/Genome.json'  + ' ***');
            }
        });
    }    
});

function retrieveChainspec(callback) {
    console.log('-***-###-@@@-&&&-- EWF Genesis ChianSpec Generator --***-###-@@@-&&&--');
    console.log('## retrieving initial chainspec file ##');
    // checking the configuration fore destination to retrieve the file
    if (!USING_LOCAL_CHAINSPEC){
        // retrieving the chainspec file from github repo
        getJSON('https://raw.githubusercontent.com/energywebfoundation/ewf-chainspec/master/Genome.json')
            .then(function(response) {
                chainspec = response;
                callback(null);
            }).catch(function(error) {
                console.log(error);
            });
    } else{
        // retrieving the local sample chainspec file
        fs.readFile(process.cwd() + '/sample_chainspc/Genome.json', (err, genesisJson) => {  
            if (err) throw err;
            chainspec = JSON.parse(genesisJson);                        
            callback(null);
        });
    }
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
                    chainspec.accounts[contractConfig.address] = {
                        balance: '1',
                        constructor: JSON.parse(contractJson).bytecode
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