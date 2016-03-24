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

if (-1 === ['accounts', 'auth', 'domains', 'dns', 'login', 'devices'].indexOf(cmd.split(/:/)[0])) {
  console.error('');
  console.error("Unknown subcommand '" + cmd + "'");
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
    console.log('');
    console.log('PURCHASED AT\t\tRENEWAL COST\tDOMAIN NAME');
    console.log('');
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
      + '\t'
      + ('$' + (result.amount / 100).toFixed(2)) + '\t'
      + '\t'
      + (result.domain || result.sld + '.' + result.tld)
      );
    });
    console.log('');
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
  console.log("  dns:unset        # remove a device or server from a domain name");
  console.log("  dns:list         # show all dns records for a given domain");
  console.log("");
  return;
}

else if ('dns:token' === cmd || 'domains:token' === cmd) {
  program
    .usage('dns:token -n <domainname>')
    .option('-d, --device <value>', 'Name of device / server to which this token is issued (defaults to os.hostname)')
    .parse(process.argv)
  ;

  if (helpme || 'string' !== typeof program.device) {
    program.help();
    return;
  }

  program.provider = cliOptions.provider;
  oauth3.domainsToken(program.opts()).then(function (results) {
    //console.log('');
    //console.log('DEVICE NAME\t\tTOKEN');
    //console.log('');
    //console.log(program.device + '\t' + results.token);
    console.log('');
    console.log('Set your DDNS client to use this URL:');
    console.log('');
    console.log('https://oauth3.org/api/com.enom.reseller/ddns?token=' + results.token);
    console.log('');
  });
}

else if ('dns:list' === cmd) {
  program
    .usage('dns:list -n <domainname>')
    .option('-n, --name <value>', 'Specify a domainname / hostname')
    .option('--all', 'Show all dns records for this account')
    .parse(process.argv)
  ;

  if (helpme || (!program.opts().all && 'string' !== typeof program.opts().name)) {
    program.help();
    return;
  }

  var promise;

  program.provider = cliOptions.provider;
  if (program.opts().all) {
    promise = oauth3.allDns(program.opts());
  }
  else {
    promise = oauth3.getDns(program.opts());
  }
  promise.then(function (results) {
    if (!results || !Array.isArray(results.records)) {
      console.error("unexpected response:");
      console.error(results);
      process.exit(1);
    }

    results.records.sort(function (a, b) {
      if (a.host > b.host) {
        return 1;
      } else if (a.host < b.host) {
        return -1;
      } else {
        return 0;
      }
    });

    console.log('');
    console.log('UPDATED AT\t\tDOMAIN NAME\tDEVICE NAME\t\tTTL\tTYPE\tVALUE');
    console.log('');
    results.records.forEach(function (record) {
      record.updatedAt = parseInt(record.updatedAt, 10) || 0;
      if (record.device.length < 10) {
        record.device += '\t';
      }
      if ('MX' === record.type) {
        record.type += ' (' + record.priority + ')';
      }
      console.log(
        new Date(record.updatedAt).toLocaleString()
      + '\t' + record.host
      + '\t' + record.device
      + '\t' + record.ttl
      + '\t' + record.type
      + '\t' + record.value
      );
    });
    console.log('');
    //console.log(Object.keys(results.records[0]));
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
    .usage('dns:set -n <domainname> -t <type> -a <answer>')
    .option('-n, --name <value>', 'Specify a domainname / hostname')
    //.option('-d, --device <value>', 'Name of device associated with the answer')
    .option(
      '-t, --type <value>'
    , 'Record type. One of: ANAME, CNAME, FWD, MX, SRV, TXT'
    //, 'Record type. One of: A, AAAA, ANAME, CNAME, DEV, FWD, MX, SRV, TXT'
    , /^(ANAME|CNAME|FWD|MX|SRV|TXT)$/i
    //, /^(A|AAAA|ANAME|CNAME|DEV|FWD|MX|SRV|TXT)$/i
    )
    .option('-a, --answer <value>', 'The value of IPv4, IPv6, CNAME, or ANAME')
    .option('--ttl <seconds>', 'time to live (default is 300 seconds - 5 minutes)')
    .option('-p, --priority <n>', 'Priority (for MX record, only)')
    .parse(process.argv)
  ;

  if (helpme || !('string' === typeof program.opts().name && program.type && program.answer)) {
    program.help();
    return;
  }

  oauth3.updateDns({
    provider: cliOptions.provider
  , domain: program.opts().name
  , answer: program.answer
  , type: program.type
  , priority: program.priority
  , device: program.device || require('os').hostname()
  }).then(function (results) {
    console.log(results);
  });
}

else if ('devices' === cmd1 && !cmd2) {
  console.log("");
  console.log("Usage: daplie devices:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help devices:COMMAND" for more details:');
  console.log("");
  console.log("  devices:list     # show all devices (and ip addresses)");
  console.log("  devices:set      # add or update a device (and related dns records)");
  console.log("  devices:unset    # remove a device (and related dns records)");
  //console.log("  devices:clone    # add all domain associations from a source device to a target device");
  //console.log("  devices:pair    # make the two devices active clones of each other");
  console.log("");
  return;
}

else if ('devices:list' === cmd) {
  program
    .usage('devices:list')
    .parse(process.argv)
  ;

  if (helpme) {
    program.help();
    return;
  }

  program.provider = cliOptions.provider;
  oauth3.getDevices().then(function (results) {
    results.devices.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      } else {
        return 0;
      }
    });

    console.log('');
    //console.log('UPDATED AT\t\tDEVICE NAME\t\tTTL\tADDRESSES');
    console.log('COMMITTED AT\t\tDEVICE NAME\tADDRESSES');
    console.log('');
    results.devices.forEach(function (device) {
      device.committedAt = parseInt(device.committedAt || 0, 10);
      if (device.name.length < 10) {
        device.name += '\t';
      }
      console.log(
        new Date(device.committedAt).toLocaleString()
      + '\t' + device.name
      //+ '\t' + device.ttl
      + '\t' + (device.addresses||[]).map(function (addr) {
          return addr.value;
        }).join(',')
      );
    });
    console.log('');
  });
}

else if ('devices:set' === cmd) {
  // set device + ip (for all associated domains)
  program
    .usage('devices:set -d <devicename> -a <ip1,ip2,...>')
    .option('-d, --device <value>', 'Name of device associated with the answer')
    .option('-a, --addresses <ip1,ip2,...>', 'Comma-separated list of IPv4 and IPv6 addresses')
    //.option('--auto', "Use this device's hostname and ip address(es)")
    .parse(process.argv)
  ;

  if (helpme || (!program.opts().auto && !(program.opts().device && program.opts().addresses))) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:set -d localhost -a 127.0.0.1,::1');
    console.log('');
    return;
  }

  oauth3.setDevice(program.opts()).then(function (results) {
    console.log('DEBUG devices:set results:');
    console.log(results);
  });
}

else if ('devices:unset' === cmd) {
  // set device + ip (for all associated domains)
  program
    .usage('devices:unset -d <devicename> --confirm delete')
    .option('-d, --device <value>', 'Name of device associated with the answer')
    .option('--confirm <delete>', 'Required to confirm that you will delete the device and ALL associated dns ip records')
    .parse(process.argv)
  ;

  if (helpme || ('delete' !== program.opts().confirm || !program.opts().device)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:unset -d localhost --confirm delete');
    console.log('');
    return;
  }

  oauth3.deleteDevice(program.opts()).then(function (results) {
    console.log('DEBUG devices:unset results:');
    console.log(results);
  });
}

else if ('devices:attach' === cmd) {
  program
    .usage('devices:attach -d <devicename> -n <domainname>')
    .option('-d, --device <value>', 'Name of device to add')
    .option('-n, --name <value>', 'Name of domain')
    .option('-a, --addresses <ip1,ip2,...>'
        , 'Update with comma-separated list of IPv4 and IPv6 addresses')
    //.option('--ttl <seconds>', 'time to live (default is 300 seconds - 5 minutes)')
    .parse(process.argv)
  ;

  if (helpme || (!program.opts().device || !program.opts().device)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:attach -d localhost -n example.com');
    console.log('');
    return;
  }

  oauth3.addDeviceToDomain(program.opts()).then(function (results) {
    console.log('DEBUG devices:attach results:');
    console.log(results);
  });
}

else if ('devices:detach' === cmd) {
  program
    .usage('devices:detach -d <devicename> -n <domainname>')
    .option('-d, --device <value>', 'Name of device to add')
    .option('-n, --name <value>', 'Name of domain')
    .parse(process.argv)
  ;

  if (helpme || (!program.opts().device || !program.opts().device)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:detach -d localhost -n example.com');
    console.log('');
    return;
  }

  oauth3.detachDevice(program.opts()).then(function (results) {
    console.log('DEBUG devices:detach results:');
    console.log(results);
  });
}

/*
else if ('devices:clone' === cmd) {
  // for when you want to move copy all associated domains of one device to a new device
  // TODO devices:pair - two-way continuous clone
  // TODO devices:unpair
  program
    .usage('devices:clone -s <source-device> -t <target-device>')
    .option('-s, --source-device <value>', 'The device from which current domain associations will be copied')
    .option('-t, --target-device <value>', 'The (new) device to add to those domains')
    .parse(process.argv)
  ;

  if (helpme || !(program.opts().sourceDevice && program.opts().targetDevice)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:clone -s old-device -t new-device');
    console.log('');
    return;
  }
}
*/

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
