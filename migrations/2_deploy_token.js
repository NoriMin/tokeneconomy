const Token = artifacts.require("./Token.sol");
const BN = require('bn.js');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync("../.config").toString().trim()).token;

module.exports = function(deployer, network, accounts) {
  const decimals = 18;
  const totalSupply = new BN('' + config.totalSupply, 10).mul(new BN('10', 10).pow(new BN(decimals, 10)));
  deployer.deploy(Token,
    config.name,
    config.symbol,
    18)
  .then((deployed) => {
    return Token.deployed();
  })
  .then((instance) => {
    return instance.mint(accounts[0], totalSupply);
  })
  .catch((err) => {
    console.error(err);
  })
};
