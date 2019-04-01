#!/bin/sh
# installs this repo, MultiSigWallet and EWF system contracts
# @TODO: don't go into genome-system-contracts branches when they are merged
if [ $1 == "install" ]
	npm install
	cd ..
	git clone https://github.com/energywebfoundation/MultiSigWallet.git
	cd MultiSigWallet
	npm install
	truffle compile
	cd ..
	git clone https://github.com/energywebfoundation/genome-system-contracts.git
else
	cd ..
	echo "Assuming that MultiSigWallet and Contracts are already there"
fi
echo "Compiling"
cd genome-system-contracts
git checkout "feat/validator_contracts"
git pull
truffle compile
git checkout "feat/reward_contract"
git pull
truffle compile
git checkout "vesting"
git pull
truffle compile
echo "Done"
