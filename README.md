# ewf-genesis-generator
EWF chain genesis JSON generator

The JSON file can be eventually manually pushed to https://github.com/energywebfoundation/ewf-chainspec

## Maintainers
**Primary**: Mani Hagh Sefat

## Quickstart
The script will download and compile MultiSigWallet and system contracts in parent directory. Be sure that you don't have a local copy already there.
```
chmod +x install.sh
./install.sh
```

## Guidelines

- **Usage**:
   To generate chain spec and include all contracts
- **Requirements**:
   - Compiled system contracts and Gnosis MultiSigWallet contract

node . --p [COMPILED-CONTRACTS-PATH] -m [COMPILED-MULTISIG-PATH]
```
node . -p ../genome-system-contracts/build/contracts/ -m ../MultiSigWallet/build/contracts/
```
