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
truffle compile
echo "Done"
