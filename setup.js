const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const readline = require('readline-promise');
const promiseRetry = require('promise-retry');

const secretLoc = __dirname + '/.secret';
const configLoc = __dirname + '/.config';
const truffleLoc = __dirname + '/truffle.js';

let rl = readline.default.createInterface({
  input: process.stdin,
  output: process.stdout
});

function setup() {
  return new Promise( (resolve, reject) => {

    let host = 'localhost:8540';
    let networkId = 10101010;

    let tokenName = 'Token';
    let tokenSymbol = 'TKN';
    let totalSupply = 100;

    rl.questionAsync('小文字のアルファベットの単語12個を入力してください：')
    .then(function(answer) {
      let mnemonic = answer.split(' ');
      let filteredMnemonic = mnemonic.filter(function(e, p) {
        return mnemonic.indexOf(e) == p;
      });

      let re = /^[a-z]+$/g;
      for ( let i in filteredMnemonic ) {
        if ( filteredMnemonic[i].match(re) === null ) {
          throw 'mnemonic: この単語は使えません。' + filteredMnemonic[i];
        }
      }

      if ( mnemonic.length != 12 ) {
        throw 'mnemonic: 単語の数が不足しています。';
      }
 
      return fs.writeFileAsync(secretLoc, answer)
    })
    .then(function() {
      return rl.questionAsync('server host: ')
    })
    .then(function(answer) {
      host = answer;
      if ( host.match(/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})$/) === null ) {
        throw 'network: 使用できないアドレスです。';
      }

      return rl.questionAsync('network id: ')
    })
    .then(function(answer) {
      networkId = parseInt(answer);
      if ( networkId != answer ) {
        throw 'network: 使用できないネットワークIDです。';
      }
      
      return rl.questionAsync('Token Name: ')
    })
    .then(function(answer) {
      tokenName = answer;
      if ( tokenName.length == 0 ) {
        throw 'token: 使用できないネットワークIDです。';
      }

      return rl.questionAsync('Token Symbol: ')
    })
    .then(function(answer) {
      tokenSymbol = answer;
      if ( tokenSymbol.length == 0 ) {
        throw 'token: 使用できないネットワークIDです。';
      }

      return rl.questionAsync('Total Supply: ')
    })
    .then(function(answer) {
      totalSupply = parseInt(answer);
      if ( totalSupply != answer ) {
        throw 'token: 使用できないネットワークIDです。';
      }

      return fs.writeFileAsync(configLoc, JSON.stringify(
        {
          'network': {'host': host, 'networkId': networkId},
          'token': {'name': tokenName, 'symbol': tokenSymbol, 'totalSupply': totalSupply},
        }
      ))
    })
    .then(function() {
      resolve();
    })
    .catch((e) => {
      reject(e);
    })
  })
}

promiseRetry(function(retry, number) {
  return setup()
  .then(function() {
  })
  .catch(function(e) {
    console.error(e);
    if ( e.indexOf('mnemonic:') == 0 ) {
      console.log('retry...');
      retry(e);
    }
    else if ( e.indexOf('network:') == 0 ) {
      console.log('retry...');
      retry(e);
    }
    else if ( e.indexOf('token:') == 0 ) {
      console.log('retry...');
      retry(e);
    }
    else {
      throw e;
    }
  })
})
.then(function() {
  console.log('done');
  process.exit(0);
})
.catch(function(e) {
})
