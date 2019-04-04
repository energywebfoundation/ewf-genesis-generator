# ewf-genesis-generator
EWF chain genesis JSON generator

The JSON file can be eventually manually pushed to https://github.com/energywebfoundation/ewf-chainspec

## Maintainers
**Primary**: Mani Hagh Sefat

## Quickstart
The script will download and compile MultiSigWallet and system contracts in a local directory.

To run the install and build in one step:
```
npm run build:install
```
If you just want to build the contracts again:
```
npm run build
```
To generate the chainspec:
```
npm run gen
```
This will put the chainspec in the `build/` folder.

## Guidelines

- **Usage**:
   To generate chain spec and include all contracts
- **Requirements**:
   - Compiled system contracts and Gnosis MultiSigWallet contract
- **Params**: The JS accepts 3 params: `-m` for the multisig wallet build folder, `-p` for the system contracts build folder, and `-b` for the output build folder where the chainspec will be generated.

```
node . --p [COMPILED-CONTRACTS-PATH] -m [COMPILED-MULTISIG-PATH]
```

```
node . -p ../genome-system-contracts/build/contracts/ -m ../MultiSigWallet/build/contracts/
```
