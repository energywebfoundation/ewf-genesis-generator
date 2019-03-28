#!/bin/sh
# installs this repo, MultiSigWallet and EWF system contracts
# @TODO: don't go into genome-system-contracts branches when they are merged
npm install
cd ..
git clone https://github.com/energywebfoundation/MultiSigWallet.git
cd MultiSigWallet
npm install
truffle compile
cd ..
git clone https://github.com/energywebfoundation/genome-system-contracts.git
cd enome-system-contracts
git checkout "feat/validator_contracts"
truffle compile
git checkout "feat/reward_contract"
truffle compile
git checkout "vesting"
truffle compile
