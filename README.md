# ewf-genesis-generator
EWF chain genesis JSON generator

## Maintainers
**Primary**: Mani Hagh Sefat

## Quickstart
```
npm install
```

## Guidelines

- **Usage**:
   To generate chain spec and include all system contracts (according to DEFAULT_CONTRACT_CONFIGS within index.js file):
- **Requirements**:
   - Compiled system contracts and Gnosis MultiSigWallet contract

node . --p [COMPILED-CONTRACTS-PATH] -m [COMPILED-MULTISIG-PATH]
```
node . -p ../genome-system-contracts/build/contracts/ -m ../MultiSigWallet/build/contracts/
```
