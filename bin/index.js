'use strict';

var oauth3 = require('oauth3');
var args = process.argv;
var cmd = args.splice(2, 1)[0];
var program = require('commander');

function help() {
  console.log("");
  console.log("Usage: daplie COMMAND [command-specific-options]");
  //console.log("Usage: daplie COMMAND [--app APP] [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "heroku help TOPIC" for more details:');
  console.log("");
  console.log("  accounts  #  manage accounts");
  console.log("  auth      #  authentication (login, logout)");
  console.log("  domains   #  manage domains");
  console.log("  dns       #  manage dns");
  console.log("");
  console.log("Additional topics:");
  console.log("");
  console.log("  help         #  list commands and display help");
  console.log("  login        #  Login with your OAuth3 credentials.");
  console.log("");
}

if (!cmd || -1 !== ['help', 'h', '--help', '-h'].indexOf(cmd)) {
  help();
  return;
}

if (-1 === ['accounts', 'auth', 'domains', 'dns', 'login'].indexOf(cmd)) {
  help();
  return;
}

console.error("Not Implemented Yet!")
