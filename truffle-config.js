const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const memonic = fs.readFileSync(".secret").toString().trim();
const provider= new HDWalletProvider({
  privateKeys:['819519033d54701f9ac18840ca77f46da8bce195047ae904f7ad75ee16f27c30'],
  providerOrUrl:"wss://data-seed-prebsc-1-s1.binance.org:8545"

})
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard BSC port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    testnet: {
      provider: () => provider,
      network_id: "97",
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.6.12", // A version or constraint - Ex. "^0.5.0"
    }
  }
}