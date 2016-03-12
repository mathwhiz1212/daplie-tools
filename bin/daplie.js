#!/usr/bin/env node

'use strict';

var oauth3 = require('oauth3-cli');
var args = process.argv;
var cmd = args.splice(2, 1)[0] || '';
var cmd1 = cmd.split(/:/)[0];
var cmd2 = cmd.split(/:/)[1];
var helpme;
var program = require('commander');
var pkg = require('../package.json');
var cliOptions = { provider: 'oauth3.org' };

function help() {
  console.log("");
  console.log("v" + pkg.version);
  console.log("");
  console.log("Usage: daplie COMMAND [command-specific-options]");
  //console.log("Usage: daplie COMMAND [--app APP] [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help TOPIC" for more details:');
  console.log("");
  //console.log("  accounts  #  manage accounts");
  console.log("  auth      #  authentication (login, logout)");
  console.log("  domains   #  purchase and manage domains");
  console.log("  dns       #  manage dns");
  //console.log("  wallet    #  manage credit cards and balance");
  console.log("");
  console.log("Additional topics:");
  console.log("");
  console.log("  help         #  list commands and display help");
  console.log("  login        #  Login with your OAuth3 credentials.");
  console.log("");
}

/*
program
  .version(pkg.version)
  .usage('COMMAND [command-specific-options]')
;
program
  .command('accounts', 'manage accounts')
  .option('-a, --add', 'Create a new account')
;
program
  .command('domains')
  .description('manage domains')
  .option('-n, --name <value>', 'Specify a domainname / hostname')
;

program.parse(args);
return;
*/

if (!cmd || -1 !== ['help', 'h', '--help', '-h', '?', '-?'].indexOf(cmd)) {
  helpme = true;
  cmd = args.splice(2, 1)[0] || '';
  cmd1 = cmd.split(/:/)[0];
  cmd2 = cmd.split(/:/)[1];
  if (!cmd) {
    help();
    return;
  }
}

if (-1 === ['accounts', 'auth', 'domains', 'dns', 'login'].indexOf(cmd.split(/:/)[0])) {
  help();
  return;
}

if ('auth' === cmd) {
  console.log("");
  console.log("Usage: daplie auth");
  console.log("");
  console.log("  Authenticate");
  //console.log("  Authenticate, display token and current user");
  console.log("");
  console.log("Additional commands, type \"daplie help COMMAND\" for more details:");
  console.log("");
  console.log("  auth:login   #  log in with your daplie credentials");
  //console.log("  auth:logout  #  clear local authentication credentials");
  //console.log("  auth:token   #  display your api token");
  //console.log("  auth:whoami  #  display your oauth3 email address");
  console.log("");
}

else if ('login' === cmd || 'auth:login' === cmd) {
  program
    .usage('auth:login  # login through oauth3.org')
        .parse(process.argv)
    ;

  if (helpme) {
    program.help();
    return;
  }

  oauth3.manualLogin(cliOptions).then(function (results) {
    if (results && results.oauth3 && results.session && results.sessionTested) {
      // TODO
      //console.log("Logged in as XYZ, using account ABC.");
      console.log("");
      console.log("Congrats, you're logged in!");
      console.log("");
      return;
    }

    console.error("Error: login object missing one or more of oauth3, session, sessionTested:");
    console.error(Object.keys(results));
  }, function (err) {
    console.error("Error with login:");
    console.error(err.stack || err);
  });
}

else if ('domains' === cmd1 && !cmd2) {
  console.log("");
  console.log("Usage: daplie domains:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help domains:COMMAND" for more details:');
  console.log("");
  console.log("  domains:list    # show domains purchased through daplie.domains");
  console.log("  domains:search  # search and purchase domains through daplie.domains");
  console.log("");
  return;
}

else if ('domains:list' === cmd) {
  if (helpme) {
    console.log("");
    console.log("  domains:list    # show domains purchased through daplie.domains");
    console.log("");
    return;
  }

  oauth3.domains(cliOptions).then(function (results) {
        results.sort(function (a, b) {
      if (a.domain < b.domain) {
        return -1;
      } else {
        return 1;
      }
    }).forEach(function (result) {
      // TODO find longest domainname for building table
        console.log(
        new Date(parseInt(result.createdAt, 10) || 0).toLocaleString()
      + '    '
      + ('$' + (result.amount / 100).toFixed(2))
      + '    '
      + (result.domain || result.sld + '.' + result.tld)
      );
        });
  });
}
else if ('domains:search' === cmd) {
  program
    .usage('domains:search')
    .option('-d, --domains <values...>', 'Comma-separated list of domains to search')
    .option('-t, --tip <n>', 'A tip (in USD) in addition to the domain purchase price')
    .option('--max-purchase-price <n>', 'Purchase domains in non-interactive mode if total <= n ($USD)')
    .parse(process.argv)
  ;

  if (helpme) {
    program.help();
    return;
  }

  oauth3.purchaseDomains({
    provider: cliOptions.provider
  , domains: program.domains
  , tip: program.tip
  , 'max-purchase-price': program['max-purchase-price'] || program.maxPurchasePrice
  }).then(function (results) {
    // TODO fix 2.9% on fee
    console.log('[make purchase result]');
    console.log(results);
    console.log("You paid $xx.x. We paid $xx.xx.");
    console.log("About $x.x will go to overhead costs and modest salaries.");
    console.log("$x.xx is fueling the future! Yay!");
  });
}
else if ('dns' === cmd1 && !cmd2) {
  console.log("");
  console.log("Usage: daplie dns:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help dns:COMMAND" for more details:');
  console.log("");
  console.log("  dns:token        # retrieve a token for dns updates (i.e. for your ddns enabled router)");
  console.log("  dns:set          # add a device or server to a domain name");
  console.log("");
  return;
}

else if ('dns:token' === cmd || 'domains:token' === cmd) {
  program
    .usage('dns:token -n <domainname>')
        .option('-n, --name <value>', 'Specify a domainname / hostname')
        .option('-d, --device <value>', 'Name of device / server to which this token is issued (defaults to os.hostname)')
    .parse(process.argv)
  ;

  if (helpme || !program.name || !program.device) {
    program.help();
    return;
  }

  program.provider = cliOptions.provider;
  oauth3.domainsToken(program).then(function (results) {
    console.log('');
    console.log('DOMAIN NAME\tDEVICE NAME\t\tTOKEN');
    console.log('');
    console.log(program.name + '\t' + program.device + '\t' + results.token);
    console.log('');
  });
}

else if ('dns:set' === cmd) {
    // daplie dns:device add <DEVICE NAME> <IPv4 or IPv6>
    // daplie dns:device remove <DEVICE NAME> <IPv4 or IPv6>
    // daplie dns:device reset <DEVICE NAME> <IPv4 or IPv6> // just one

    // daplie dns:domain add <DOMAIN NAME> <TYPE> <DEVICE NAME> <TTL> <PRIORITY>
    // daplie dns:domain remove <DOMAIN NAME> <DEVICE NAME>
    // daplie dns:domain reset <DOMAIN NAME> <DEVICE NAME> // just one

    // daplie dns:update

    // TODO update device by ip
    // TODO add or remove device from domain
    program
    .usage('dns:set')
        .option('-n, --name <value>', 'Specify a domainname / hostname')
        .option('-d, --device <value>', 'Name of device associated with the answer')
        .option(
            '-t, --type <value>'
        , 'Record type. One of: A, AAAA, ANAME, CNAME, FWD, MX, SRV, TXT'
        , /^(A|AAAA|ANAME|CNAME|FWD|MX|SRV|TXT)$/i
        )
        .option('-a, --answer <value>', 'The value of IPv4, IPv6, CNAME, or ANAME')
        .option('-p, --priority <n>', 'Priority (for MX record, only)')
        .parse(process.argv)
    ;

  if (helpme || !(program.name && program.answer)) {
    program.help();
    return;
  }

  oauth3.updateDns({
    provider: cliOptions.provider
  , domain: program.name
    , answer: program.answer
    , type: program.type
    , priority: program.priority
  , device: program.device || require('os').hostname()
  }).then(function (results) {
    console.log(results);
  });
}
else if ('device:set' === cmd) {
  // set device + ip (for all associated domains)
  console.error("'" + cmd + "' Not Implemented Yet!");
}
else if ('device:unset' === cmd) {
  // unset device (and remove from all associated domains)
  console.error("'" + cmd + "' Not Implemented Yet!");
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
