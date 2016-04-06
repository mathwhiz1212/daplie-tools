#!/usr/bin/env node

'use strict';

var oauth3 = require('oauth3-cli');
var args = process.argv;
var cmd = args.splice(2, 1)[0] || '';
var myCmds = cmd.split(/:/);
var cmd1 = myCmds[0];
var cmd2 = myCmds[1];
var helpme;
var program = require('commander');
var pkg = require('../package.json');
var cliOptions = { provider: 'oauth3.org' };
var cmds;

function pad(n) {
  n = n.toString();
  while (n.length < 2) {
    n = '0' + n;
  }

  return n;
}

function help() {
  console.log("");
  console.log("v" + pkg.version);
  console.log("");
  console.log("Usage: daplie COMMAND [command-specific-options]");
  //console.log("Usage: daplie COMMAND [--app APP] [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help TOPIC" for more details:');
  console.log("");
  console.log("  accounts   #  manage accounts");
  console.log("  auth       #  authentication (login, logout)");
  console.log("  devices    #  manage IP devices");
  console.log("  dns        #  manage dns");
  console.log("  domains    #  purchase and manage domains");
  console.log("  wallet     #  see and manage funding sources (credit cards)"); // and balance
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
  cmd1 = myCmds[0];
  cmd2 = myCmds[1];
  if (!cmd) {
    help();
    return;
  }
}

cmds = [
  'accounts'
, 'auth'
, 'devices'
, 'dns'
, 'domains'
, 'login'
, 'wallet'
];
if (-1 === cmds.indexOf(cmd.split(/:/)[0])) {
  console.error('');
  console.error("Unknown subcommand '" + cmd + "'");
  help();
  return;
}

function listCards(opts, card1) {
  return oauth3.Cards.list(opts).then(function (results) {
    var cards = results.results || results;
    console.log('');
    console.log('PRIORITY\tBRAND\tLAST 4\tEXPIRES\tDEFAULT\tNICK\t\tCOMMENT');
    console.log('');
    cards.forEach(function (card) {
      var brand = card.brand
        .replace(/American Express/i, 'AMEX')
        .replace(/MasterCard/i, 'MC')
        .replace(/Discover/i, 'Disc')
      ;
      var isDefault = '      ';
      if (card1 && card1.brand === card.brand && card1.exp === card.exp) {
        brand = '^' + brand;
      }
      if (card.default) {
        //brand += '*';
        isDefault = '  YES  ';
      }
      console.log(
        (card.priority || 'ERR')
      + '\t\t' + brand
      + '\t' + card.last4 // TODO xxxx-xxxx-xxxx-abcd
      + '\t' + pad(card.exp_month) + '/' + String(card.exp_year).slice(2)
      + '\t' + isDefault
      + '\t' + (card.nick || '')
      + '\t' + (card.comment || '')
      );
    });
    console.log('');
  });
}

if ('accounts' === cmd1 && !cmd2) {
  console.log("");
  console.log("Usage: daplie accounts:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help accounts:COMMAND" for more details:');
  console.log("");
  console.log("  accounts:list    # show all accounts for current login(s)");
//  console.log("  accounts:select  # set the current account");
  console.log("");
  return;
}

else if ('accounts:list' === cmd) {
  if (helpme) {
    console.log("");
    console.log("  accounts:list    # show all accounts for current login(s)");
    console.log("");
    return;
  }

  program.provider = cliOptions.provider;
  oauth3.Accounts.list(program.opts()).then(function (results) {
    console.log('');
    console.log(JSON.stringify(results, null, '  '));
    console.log(results.accounts.length);
    console.log('');
  });
}

else if ('auth' === cmd) {
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
  console.log("  dns:set          # add a device or server to a domain name");
  console.log("  dns:unset        # remove a device or server from a domain name");
  console.log("  dns:list         # show all dns records for a given domain");
  console.log("");
  return;
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
      + '\t' + (record.host || '@')
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
  , ttl: program.ttl
  , priority: program.priority
  }).then(function (results) {
    console.log(results);
  });
}

else if ('dns:unset' === cmd) {
  program
    .usage('dns:unset -n <domainname> -t <type> -a <answer>')
    .option('-n, --name <value>', 'Specify a domainname / hostname')
    .option(
      '-t, --type <value>'
    , 'Record type. One of: ANAME, CNAME, FWD, MX, SRV, TXT'
    , /^(ANAME|CNAME|FWD|MX|SRV|TXT)$/i
    )
    .option('-a, --answer <value>', 'The value of IPv4, IPv6, CNAME, or ANAME')
    .parse(process.argv)
  ;

  if (helpme || !('string' === typeof program.opts().name && program.type && program.answer)) {
    program.help();
    return;
  }

  oauth3.removeDns({
    provider: cliOptions.provider
  , domain: program.opts().name
  , answer: program.answer
  , type: program.type
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
  console.log("  devices:token    # get ddns token for router/device/domain/dns updates");
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

  program.provider = cliOptions.provider;
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

  program.provider = cliOptions.provider;
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

  program.provider = cliOptions.provider;
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

  if (helpme || (!program.opts().device || !program.opts().name)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:detach -d localhost -n example.com');
    console.log('');
    return;
  }

  program.provider = cliOptions.provider;
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

else if ('devices:token' === cmd || 'dns:token' === cmd || 'domains:token' === cmd) {
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
  oauth3.devices.token(program.opts()).then(function (results) {
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

else if ('wallet' === cmd) {
  console.log("");
  console.log("Usage: daplie wallet:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help wallet:COMMAND" for more details:');
  console.log("");
  console.log("  wallet:sources           # show all funding sources");
  console.log("  wallet:sources:add       # add a new credit card");
  console.log("  wallet:sources:remove    # remove a credit card");
  console.log("  wallet:sources:update    # set the default (or the priority)");
  //console.log("  wallet:sources:default   # alias of wallet:sources:update --default");
  console.log("");
  return;
}

else if ('wallet:sources' === cmd) {
  program.provider = cliOptions.provider;
  var opts = program.opts();

  listCards(opts, null);
}

else if ('wallet:sources:add' === cmd) {
  program
    .usage('wallet:sources:add')
    .option('--cc-number <value>', 'Credit Card number (xxxx-xxxx-xxxx-xxxx)')
    .option('--cc-exp <value>', 'Credit Card expiration (mm/yy)')
    .option('--cc-cvc <value>', 'Credit Card Verification Code (xxx)')
    .option('--cc-email <value>', 'Credit Card email (xxxxxx@xxxx.xxx)')
    .option('--cc-nick <value>', 'Credit Card nickname (defaults to email)')

    .option('--priority <n>', 'Manually set the priority (where 100 is high, 1000 is low)')
    .option('--nick <value>', 'Choose a new nickname for this card')
    .option('--comment <value>', 'Set an arbirtrary comment for this card')
    //.option('--cc- <value>', '')
    .parse(process.argv)
  ;

  if (helpme) {
    program.help();
    console.log('');
    console.log('Example: daplie wallet:sources:add');
    console.log('');
    return;
  }

  var opts = program.opts();
  opts.ccPriority = opts.priority;
  opts.ccNick = opts.nick;
  opts.ccComment = opts.comment;
  program.provider = cliOptions.provider;
  oauth3.Cards.add(program.opts()).then(function (card1) {
    return listCards(opts, card1);
  });
}

else if ('wallet:sources:update' === cmd) {
  program
    .usage('wallet:sources:update --last4 <xxxx>')
    .option('--last4 <value>', 'Last 4 of credit card (xxxx-xxxx-xxxx-XXXXX)')

    .option('--comment <value>', 'Set an arbirtrary comment for this card')
    .option('--default', 'Set this card as default (sets priority to highest)')
    //.option('--exp <value>', 'Update the expiration date (and re-test card authorization)')
    //.option('--new-nick <value>', 'Choose a new nickname for this card')
    //.option('--email <value>', 'Choose a new receipt email for this card')
    .option('--nick <value>', 'Choose a new nickname for this card')
    .option('--priority <n>', 'Manually set the priority (where 100 is high, 1000 is low)')
    .parse(process.argv)
  ;

  var opts = program.opts();
  if (helpme
    || !(opts.last4)
    || !(opts.default || opts.priority || opts.nick || opts.comment || opts.exp)
  ) {
    program.help();
    console.log('');
    console.log("Example: daplie wallet:sources:update --last4 4321");
    console.log('');
    return;
  }

  var opts = program.opts();
  opts.ccPriority = opts.priority;
  opts.ccNick = opts.nick;
  opts.ccComment = opts.comment;
  if (opts.brand) {
    if ('amex' === opts.brand.toLowerCase()) {
      program.brand = 'American Express';
    }
    else if ('mc' === opts.brand.toLowerCase()) {
      program.brand = 'MasterCard';
    }
    else if ('disc' === opts.brand.toLowerCase()) {
      program.brand = 'Discover';
    }
    else if (/^(dci|diner)/i.test(opts.brand)) {
      program.brand = 'Diners Club';
    }
  }

  opts.provider = cliOptions.provider;
  oauth3.Cards.update(opts).then(function (updatedCard) {
    return listCards(opts, null);
  });
}

else if ('wallet:sources:remove' === cmd) {
  program
    .usage('wallet:sources:remove --last4 <xxxx>')
    .option('--last4 <value>', 'Last 4 of credit card (xxxx-xxxx-xxxx-XXXXX)')
    .option('--brand <value>', 'Card brand (Visa, MC, AMEX, Disc, etc)')
    .option('--exp <value>', 'Card expiration (mm/yy)')
    //.option('--cc- <value>', '')
    .parse(process.argv)
  ;

  if (helpme) {
    program.help();
    console.log('');
    console.log("Example: daplie wallet:sources:remove --brand 'American Express' --last4 4321 --exp 01/35");
    console.log('');
    return;
  }

  if (program.opts().brand) {
    if ('amex' === program.opts().brand.toLowerCase()) {
      program.brand = 'American Express';
    }
    else if ('mc' === program.opts().brand.toLowerCase()) {
      program.brand = 'MasterCard';
    }
    else if ('disc' === program.opts().brand.toLowerCase()) {
      program.brand = 'Discover';
    }
    else if (/^(dci|diner)/i.test(program.opts().brand)) {
      program.brand = 'Diners Club';
    }
  }

  program.provider = cliOptions.provider;
  oauth3.Cards.remove(program.opts()).then(function (/*deletedCard*/) {
    return listCards(opts, null);
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
