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

node . --p [COMPILED-CONTRACTS-PATH]
```
node . --p /.../genome-system-contracts/build/contracts
```
   - To generate for specific contract:

node . --p [COMPILED-CONTRACT-PATH] --cn [DESIRED-CONTRACT-NAME] --ca [DESIRED-CONTRACT-ADDRESS]
```
node . --p /.../genome-system-contracts/build/contracts --cn ValidatorFoo --ca 0x1000000000000000000000000000000000000005
```
