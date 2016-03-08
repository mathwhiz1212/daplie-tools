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

if (-1 === ['accounts', 'auth', 'domains', 'dns', 'login'].indexOf(cmd.split(/:/)[0])) {
  help();
  return;
}

if ('login' === cmd || 'auth:login' === cmd) {
  require('../../oauth3-cli/').manualLogin().then(function (results) {
    if (results && results.oauth3 && results.session && results.sessionTested) {
      console.log("Login completed successfully.");
      return;
    }

    console.error("Error with login:");
    console.error(results);
  }, function (err) {
    console.error("Error with login:");
    console.error(err.stack || err);
  });
}
else if ('domains' === cmd || 'domains:list' === cmd) {
  require('../../oauth3-cli/').domains().then(function (results) {
    console.log(results);
  });
}
else if ('domains:token' === cmd) {
  require('../../oauth3-cli/').domainsToken().then(function (results) {
    console.log(results);
  });
}
else if ('dns:update' === cmd) {
  require('../../oauth3-cli/').domainsToken({
    domain: 'coolie.coolaj85.com'
  , device: require('os').hostname()
  }).then(function (results) {
    console.log(results);
  });
}
else {
  console.error("'" + cmd + "' Not Implemented Yet!");
}

process.on('unhandledRejection', function(reason, p) {
  console.log("Possibly Unhandled Rejection at:");
  console.log("Promise: ", p);
  console.log(p.stack);
  console.log("Reason: ", reason);
  console.log(reason.stack);
  process.exit(1);
  // application specific logging here
});
