const HDWalletProvider = require('truffle-hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
const config = JSON.parse(fs.readFileSync(".config").toString().trim()).network;

module.exports = {
  networks: {
    azure: {
      provider: () => new HDWalletProvider(mnemonic, config.host),
      network_id: config.networkId,
      gasPrice: 0
     }
  }
}
