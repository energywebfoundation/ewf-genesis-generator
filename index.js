#!/usr/bin/env node

// include dependencies
const fs = require('fs');
const fsExtra = require('fs-extra');
const Web3 = require('web3');
const ganache = require("ganache-core");

// parse argument variables
const args = require('minimist')(process.argv.slice(2));

// argument variable settings
const CONTRACTS_PATH = args['p'];
const MULTISIG_PATH = args['m'];
const BUILD_PATH = args['b'];
let SPEC_NAME = args['s'];

if (SPEC_NAME == undefined || SPEC_NAME == null) {
    SPEC_NAME = "ewc"
}

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


function main() {
    retrieveChainspec();
    retrieveValues();
    addPoaParams();
    addMultiSigs();
    addEWAG();
    addIgnitor();
    addRegistry();
    retrieveContractsBytecode();

    let data = JSON.stringify(chainspec, null, 4);
    var buildPath = '';

    if (BUILD_PATH) {
        buildPath = BUILD_PATH;
    } else {
        buildPath = process.cwd() + '/build/';
    }

    if (buildPath != '') {
        let fileName = SPEC_NAME.charAt(0).toUpperCase() + SPEC_NAME.slice(1) + '.json';
        fsExtra.outputFile(buildPath + '/' + fileName, data, err => {
            if (!err) {
                console.log('*** Chain Spec file generated successfully at ' + buildPath + '/' + fileName + ' ***');
            }
        });
    }
}

// retrieves a very basic (hardcoded) chainspec
function retrieveChainspec() {
    console.log('### Retrieving chainspec skeleton...');
    // retrieving the local sample chainspec file
    let genesisJson = fs.readFileSync(process.cwd() + '/chainspec_skeletons/' + SPEC_NAME + '.json');
    chainspec = JSON.parse(genesisJson);
}

// retrieves the addresses and parameters
function retrieveValues() {
    console.log('### Retrieving hardcoded chainspec values...');
    // retrieving the local sample chainspec file
    let nlo = SPEC_NAME.toLowerCase();
    let nsplit = nlo.split('_');
    let fending = nsplit.slice(-1)[0] === 'hcs' ? nsplit.slice(0,-1).join('_') : nlo;
    let jso = fs.readFileSync(process.cwd() + '/chainspec_skeletons/hardcoded_values_' + fending  + '.json');
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
    EWAG_MULTISIG = values.address_book["EWAG_MULTISIG"];

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
            params: [
                COMMUNITY_FUND,
                COMMUNITY_REWARD
            ],
            params_types: ['address', 'uint']
        },
        {
            address: VESTING,
            name: 'Holding',
            balance: TARGET_AMOUNT,
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
            name: 'MultiSigWallet',
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
        },
        {
            address: EWAG_MULTISIG,
            name: 'MultiSigWallet',
            description: 'Wallet of the EWAG',
            params: [
                values.address_book["EWAG_MEMBERS"],
                values.multisig_required["EWAG"]
            ],
            params_types: ['address[]', 'uint']
        }
    ];
}

// adds multisig contracts
function addMultiSigs() {
    console.log('### Adding multi sig contracts...');

    if (MULTISIG_PATH != undefined) {
        for (let i = 0; i < DEFAULT_MULTISIG_CONFIGS.length; i++) {
            let contractJson = fs.readFileSync(MULTISIG_PATH + '/' + DEFAULT_MULTISIG_CONFIGS[i].name + '.json');
            let _constructor = encodeParamToByteCode(JSON.parse(contractJson).bytecode, DEFAULT_MULTISIG_CONFIGS[i]);
            let _balance;
            if (typeof DEFAULT_MULTISIG_CONFIGS[i].balance !== 'undefined')
                _balance = DEFAULT_MULTISIG_CONFIGS[i].balance;

            chainspec.accounts[DEFAULT_MULTISIG_CONFIGS[i].address] = {
                balance: _balance,
                constructor: _constructor
            };
        }
    }
}

// adds system contracts
function retrieveContractsBytecode() {
    console.log('### Adding system contracts bytecodes...');

    if (CONTRACTS_PATH != undefined) {
        for (let i = 0; i < DEFAULT_CONTRACT_CONFIGS.length; i++) {
            // retrieving the compiled contract bytecode
            let contractJson = fs.readFileSync(CONTRACTS_PATH + '/' + DEFAULT_CONTRACT_CONFIGS[i].name + '.json');

            console.log("Adding " + DEFAULT_CONTRACT_CONFIGS[i].description + "..")
            let _constructor = encodeParamToByteCode(JSON.parse(contractJson).bytecode, DEFAULT_CONTRACT_CONFIGS[i]);
            let _balance;
            if (typeof DEFAULT_CONTRACT_CONFIGS[i].balance !== 'undefined')
                _balance = DEFAULT_CONTRACT_CONFIGS[i].balance;

            chainspec.accounts[DEFAULT_CONTRACT_CONFIGS[i].address] = {
                balance: _balance,
                constructor: _constructor
            }
        }
    } else {
        console.log("Compiled built contract path no defined, usage: --p <YOUR_COMPILED_CONTRACT_PATH>");
    }
}

// modifies the Aura parameters
function addPoaParams() {
    // link validators set
    chainspec.engine.authorityRound.params["validators"] = {
        contract: VALIDATOR_RELAY
    };
    // link reward contract
    chainspec.engine.authorityRound.params["blockRewardContractAddress"] = REWARD;
    chainspec.engine.authorityRound.params["blockRewardContractTransition"] = "0";
}

// adds balance to EWAG account
function addEWAG() {
    chainspec.accounts[values.address_book["EWAG_MULTISIG"]].balance = values.balances["EWAG"];
    console.log("EWAG done");
}

// adds ignitor accounts
function addIgnitor() {
    for (let i = 0; i < values.address_book["IGNITOR_MEMBERS"].length; i++) {
        chainspec.accounts[values.address_book["IGNITOR_MEMBERS"][i]] = {
            balance: values.balances["IGNITOR"]
        };
    }
    console.log("Ignitor done");
}

// adds registry
function addRegistry() {
    chainspec.params["registrar"] = values.address_book["REGISTRY"];
    console.log("Registry done")
}

// prepares the bytecode of the contracts
function encodeParamToByteCode(bytecode, contractConf) {
    if (contractConf.params_types.length !== contractConf.params.length) {
        throw contractConf.name + " types and values do not match"
    }
    //encode the parameters
    parameters = web3.eth.abi.encodeParameters(contractConf.params_types, contractConf.params);
    //merge bytecode and parameters
    return bytecode.concat(parameters.slice(2))
}

main();
