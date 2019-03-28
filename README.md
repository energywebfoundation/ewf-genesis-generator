# ewf-genesis-generator
EWF chain genesis JSON generator

## Maintainers
**Primary**: Mani Hagh Sefat

## Quickstart
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
