# EWF genesis generator
EWF chain genesis JSON generator script. Used for Volta and EWC.

The JSON file can be eventually manually pushed to https://github.com/energywebfoundation/ewf-chainspec.

## Maintainers
**Primary**: Mani Hagh Sefat (@manihagh)

Pietro Danzi (@danzipie), Adam Nagy (@ngyam)

## Pre-requisites
- node 8
- npm

## Quickstart
The [build](./build.sh) script will download [MultiSigWallet](https://github.com/gnosis/MultiSigWallet) and [system contracts](https://github.com/energywebfoundation/ewc-system-contracts) in a local directory named `.cloned_repos/` then compile them.

To run the install and build in one step:
```bash
# for ewc
npm run build:install
# for volta
npm run build:install:volta
```
If you just want to build the contracts again:
```bash
# for ewc
npm run build
# for volta
npm run build:volta
```
To generate the chainspec:
```bash
# for ewc
npm run gen
# for volta
npm run gen:volta
```
This will put the generated chainspec into the `build/` folder.

## Using the generator [script](./index.js)

 1. Make sure that the contracts are pulled and compiled, if not, run ```npm run build:install``` or ```npm run build:install:volta``` 
 2. Make sure that the necessary input files are put to the [./chainspec_skeletons](./chainspec_skeletons) folder:
    - `[SPEC_NAME].json`: chainspec skeleton which needs to be filled with genesis contracts and accounts. SPEC_NAME should be lowercase, e.g for Volta chain is: `volta` -> `volta.json`.
    - `hardcoded_values_[SPEC_NAME].json`: all the necessary hardcoded addresses to be used in the chainspec. For `volta` -> `hardcoded_values_volta.json`.
 3. Do ```npm run gen``` or ```npm run gen:volta```, or ```./index.js``` with params manually.

**Params**: The script accepts 3 params:
 - `-m`: multisig wallet build folder
 - `-p`: system contracts build folder
 - `-b`: output build folder where the chainspec will be generated.
 - `-s`: spec name/config

```
node . --p [COMPILED-CONTRACTS-PATH] -m [COMPILED-MULTISIG-PATH] -b [OUTPUT_BUILD_PATH] -s [SPEC_NAME]
```
e.g. the default params are:
```
node . -p "./.cloned_repos/ewc-system-contracts/build/contracts/" -m "./.cloned_repos/MultiSigWallet/build/contracts/" -b "./build" -s volta
```

## Contributing

Please read our [CONTRIBUTING guide](./CONTRIBUTING.md) for our code of conduct and for the process of submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## License

This project is licensed under the GPLv3 License - see the [LICENSE](./LICENSE) file for details.

## FAQ

1. How do I get the SHA3 value of the spec file?

A command is:
```
openssl dgst -sha256 build/$(chainspec_name_here)
```
