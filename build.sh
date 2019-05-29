#!/usr/bin/env bash

# installs this repo, MultiSigWallet and EWF system contracts
# default values should be for EWF mainnet

cdir="$( cd "$(dirname "$0")" ; pwd -P )"

CONTRACT_REPO_NAME=${CONTRACT_REPO_NAME:-"ewc-system-contracts"}
TAG=${TAG:-"v1.0.1"}

if [[ ${1} == "install" ]]; then
	npm install
    rm -rf "${cdir}/.cloned_repos/${CONTRACT_REPO_NAME}"
    mkdir -p "${cdir}/.cloned_repos"
	cd "${cdir}/.cloned_repos"
    git clone https://github.com/energywebfoundation/MultiSigWallet.git
	cd MultiSigWallet
	npm install
    # we need to compile contracts with a newer truffle
    npm uninstall truffle
    npm install truffle
	npx truffle compile
	cd ..
	git clone git@github.com:energywebfoundation/${CONTRACT_REPO_NAME}.git
    cd "${CONTRACT_REPO_NAME}"
    git checkout tags/${TAG}
    npm install -D
else
	echo "Assuming that MultiSigWallet and Contracts are already there"
fi
echo "Compiling system contracts"
cd "${cdir}/.cloned_repos/${CONTRACT_REPO_NAME}"
git checkout tags/${TAG}
npx truffle compile
echo "Done"
