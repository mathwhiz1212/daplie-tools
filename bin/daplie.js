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

function mergeDefaults(program) {
  var opts = program.opts();

  // name, defaults
  /*
  [ 'name', 'defaults' ].forEach(function (key) {
    if ('function' === typeof opts[key]) {
      delete opts[key];
    }
  });
  */
  Object.keys(opts).forEach(function (key) {
    if ('function' === typeof opts[key]) {
      delete opts[key];
    }
  });

  Object.keys(cliOptions).forEach(function (key) {
    if (undefined === opts[key]) {
      opts[key] = cliOptions[key];
    }
  });

  return opts;
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
  console.log("  addresses  #  manage addresses");
  console.log("  auth       #  authentication (login, logout)");
  console.log("  devices    #  manage IP devices");
  console.log("  dns        #  manage dns");
  console.log("  domains    #  purchase and manage domains");
  console.log("  ns         #  manage nameservers");
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
, 'addresses'
, 'auth'
, 'devices'
, 'dns'
, 'domains'
, 'glue'
, 'login'
, 'ns'
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

var all = {};

all.accounts = function () {
  console.log("");
  console.log("Usage: daplie accounts:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help accounts:COMMAND" for more details:');
  console.log("");
  console.log("  accounts:list    # show all accounts for current login(s)");
//  console.log("  accounts:select  # set the current account");
  console.log("");
};

all['accounts:list'] = function () {
  var opts = mergeDefaults(program);

  if (helpme) {
    console.log("");
    console.log("  accounts:list    # show all accounts for current login(s)");
    console.log("");
    return;
  }

  oauth3.Accounts.list(opts).then(function (results) {
    console.log('');
    console.log(JSON.stringify(results, null, '  '));
    console.log(results.accounts.length);
    console.log('');
  });
};

all.addresses = function () {
  console.log("");
  console.log("Usage: daplie addresses:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help addresses:COMMAND" for more details:');
  console.log("");
  console.log("  addresses:list    # show all addresses for current account");
//  console.log("  accounts:select  # set the current account");
  console.log("");
};

all['addresses:list'] = function () {
  var opts = mergeDefaults(program);

  if (helpme) {
    console.log("");
    console.log("  addresses:list    # show all mailing addresses for current login(s)");
    console.log("");
    return;
  }

  oauth3.Addresses.list(opts).then(function (results) {
    console.log('');
    console.log(JSON.stringify(results, null, '  '));
    //console.log(results.accounts.length);
    console.log('');
  });
};

all.auth = function () {
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
};

all.login = all['auth:login'] = function () {
  program
    .usage('auth:login  # login through oauth3.org')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme) {
    program.help();
    return;
  }

  oauth3.manualLogin(opts).then(function (results) {
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
};

all.domains = function () {
  console.log("");
  console.log("Usage: daplie domains:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help domains:COMMAND" for more details:');
  console.log("");
  console.log("  domains:attach   # attach a device to a domain");
  console.log("  domains:detach   # detach a device from a domain");
  console.log("  domains:list     # show domains purchased through daplie.domains");
  console.log("  domains:search   # search and purchase domains through daplie.domains");
  console.log("");
  return;
};

all['domains:list'] = function () {
  var opts = mergeDefaults(program);

  if (helpme) {
    console.log("");
    console.log("  domains:list    # show domains purchased through daplie.domains");
    console.log("");
    return;
  }

  oauth3.Domains.all(opts).then(function (results) {
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
};

all['domains:search'] = function () {
  program
    .usage('domains:search')
    .option('-n, --domainnames <values...>', 'Comma-separated list of domains to search')
    .option('--tip <n>', 'A tip (in USD) in addition to the domain purchase price')
    .option('--max-purchase-price <n>', 'Purchase domains in non-interactive mode if total <= n ($USD)')
    .option('-d, --domains <values...>', '(deprecated) Comma-separated list of domains to search')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme) {
    program.help();
    return;
  }

  oauth3.Domains.purchase({
    provider: opts.provider
  , domains: opts.domainnames || opts.domains
  , tip: opts.tip
  , 'max-purchase-price': opts['max-purchase-price'] || opts.maxPurchasePrice
  }).then(function (results) {
    // TODO fix 2.9% on fee
    console.log('[make purchase result]');
    console.log(results);
    console.log("You paid $xx.x. We paid $xx.xx.");
    console.log("About $x.x will go to overhead costs and modest salaries.");
    console.log("$x.xx is fueling the future! Yay!");
  });
};

all.dns = function () {
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
};

all['dns:list'] = function () {
  program
    .usage('dns:list -n <domainname>')
    .option('-n, --name <value>', 'Specify a domainname / hostname')
    .option('--all', 'Show all dns records for this account')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || (!opts.all && 'string' !== typeof opts.name)) {
    program.help();
    return;
  }

  var promise;

  if (opts.all) {
    promise = oauth3.Dns.all(opts);
  }
  else {
    promise = oauth3.Dns.get(opts);
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
};

all['dns:set'] = function () {
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

  var opts = mergeDefaults(program);
  if (helpme || !('string' === typeof opts.name && opts.type && opts.answer)) {
    program.help();
    return;
  }

  oauth3.Dns.set({
    provider: opts.provider
  , domain: opts.name
  , answer: opts.answer
  , type: opts.type
  , ttl: opts.ttl
  , priority: opts.priority
  }).then(function (results) {
    console.log(results);
  });
};

all['dns:unset'] = function () {
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

  var opts = mergeDefaults(program);
  if (helpme || !('string' === typeof opts.name && opts.type && opts.answer)) {
    program.help();
    return;
  }

  oauth3.Dns.destroy({
    provider: cliOptions.provider
  , domain: opts.name
  , answer: opts.answer
  , type: opts.type
  }).then(function (results) {
    console.log(results);
  });
};

all.devices = function () {
  console.log("");
  console.log("Usage: daplie devices:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help devices:COMMAND" for more details:');
  console.log("");
  console.log("  devices:attach   # attach a device to a domain");
  console.log("  devices:detach   # detach a device from a domain");
  console.log("  devices:list     # show all devices (and ip addresses)");
  console.log("  devices:set      # add or update a device (and related dns records)");
  console.log("  devices:unset    # remove a device (and related dns records)");
  console.log("  devices:token    # get ddns token for router/device/domain/dns updates");
  //console.log("  devices:clone    # add all domain associations from a source device to a target device");
  //console.log("  devices:pair    # make the two devices active clones of each other");
  console.log("");
  return;
};

all['devices:list'] = function () {
  program
    .usage('devices:list')
    .parse(process.argv)
  ;

  if (helpme) {
    program.help();
    return;
  }

  oauth3.Devices.all().then(function (results) {
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
};

all['devices:set'] = function () {
  // set device + ip (for all associated domains)
  program
    .usage('devices:set -d <devicename> -a <ip1,ip2,...>')
    .option('-d, --device <value>', 'Name of device associated with the answer')
    .option('-a, --addresses <ip1,ip2,...>', 'Comma-separated list of IPv4 and IPv6 addresses')
    //.option('--auto', "Use this device's hostname and ip address(es)")
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || (!opts.auto && !(opts.device && opts.addresses))) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:set -d localhost -a 127.0.0.1,::1');
    console.log('');
    return;
  }

  oauth3.Devices.set(opts).then(function (results) {
    console.log('DEBUG devices:set results:');
    console.log(results);
  });
};

all['devices:unset'] = function () {
  // set device + ip (for all associated domains)
  program
    .usage('devices:unset -d <devicename> --confirm delete')
    .option('-d, --device <value>', 'Name of device associated with the answer')
    .option('--confirm <delete>', 'Required to confirm that you will delete the device and ALL associated dns ip records')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || ('delete' !== opts.confirm || !opts.device)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:unset -d localhost --confirm delete');
    console.log('');
    return;
  }

  oauth3.Devices.destroy(opts).then(function (results) {
    console.log('DEBUG devices:unset results:');
    console.log(results);
  });
};

all['devices:attach'] = all['domains:attach'] = function () {
  program
    .usage('devices:attach -d <devicename> -n <domainname>')
    .option('-d, --device <value>', 'Name of device to add')
    .option('-n, --name <value>', 'Name of domain')
    .option('-a, --addresses <ip1,ip2,...>'
        , 'Update with comma-separated list of IPv4 and IPv6 addresses')
    //.option('--ttl <seconds>', 'time to live (default is 300 seconds - 5 minutes)')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || (!opts.device || !opts.name)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:attach -d localhost -n example.com');
    console.log('');
    return;
  }

  oauth3.Devices.attach(opts).then(function (results) {
    console.log('DEBUG devices:attach results:');
    console.log(results);
  });
};

all['devices:detach'] = all['domains:detach'] = function () {
  program
    .usage('devices:detach -d <devicename> -n <domainname>')
    .option('-d, --device <value>', 'Name of device to add')
    .option('-n, --name <value>', 'Name of domain')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || (!opts.device || !opts.name)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:detach -d localhost -n example.com');
    console.log('');
    return;
  }

  oauth3.Devices.detach(opts).then(function (results) {
    console.log('DEBUG devices:detach results:');
    console.log(results);
  });
};

/*
all['devices:clone'] = function () {
  // for when you want to move copy all associated domains of one device to a new device
  // TODO devices:pair - two-way continuous clone
  // TODO devices:unpair
  program
    .usage('devices:clone -s <source-device> -t <target-device>')
    .option('-s, --source-device <value>', 'The device from which current domain associations will be copied')
    .option('-t, --target-device <value>', 'The (new) device to add to those domains')
    .parse(process.argv)
  ;

  if (helpme || !(opts.sourceDevice && opts.targetDevice)) {
    program.help();
    console.log('');
    console.log('Example: daplie devices:clone -s old-device -t new-device');
    console.log('');
    return;
  }
}
*/

all['devices:token'] = all['dns:token'] = all['domains:token'] = function () {
  program
    .usage('dns:token -n <domainname>')
    .option('-d, --device <value>', 'Name of device / server to which this token is issued (defaults to os.hostname)')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || 'string' !== typeof opts.device) {
    program.help();
    return;
  }

  oauth3.Devices.token(opts).then(function (results) {
    //console.log('');
    //console.log('DEVICE NAME\t\tTOKEN');
    //console.log('');
    //console.log(opts.device + '\t' + results.token);
    console.log('');
    console.log('Set your DDNS client to use this URL:');
    console.log('');
    console.log('https://oauth3.org/api/com.enom.reseller/ddns?token=' + results.token);
    console.log('');
  });
};

//
// NameServer Glue Records
//
all.glue = function () {
  console.log("");
  console.log("Usage: daplie glue:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help glue:COMMAND" for more details:');
  console.log("");
  console.log("  glue:list      # show nameserver glue records");
  console.log("  glue:set       # set nameserver glue records");
  console.log("");
};
all['glue:list'] = function () {
  program
    .usage('glue:list')
    .option('-a, --all', 'Show all')
    .option('-n, --name <value>', 'Filter by domain name')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);

  if (helpme || !(opts.name || opts.all)) {
    program.help();
    console.log('');
    console.log('Example: daplie glue:list --all');
    console.log('');
    return;
  }

  return oauth3.Glue.all(opts).then(function (records) {
    if (opts.name) {
      records = records.filter(function (r) {
        return ('.' + opts.name).length ===
          r.name.lastIndexOf('.' + opts.name) - r.name.length;
      });
    }
    console.log("");
    console.log('      NAME      ' + '\t' + '       IP       ');
    console.log('----------------' + '\t' + '----------------');
    records.forEach(function (r) {
      console.log(r.name + '\t' + r.ip);
    });
    console.log("");
  });
};
all['glue:set'] = function () {
  program
    .usage('glue:set')
    .option('-n, --name <value>', 'Specify a domainname such as ns1.example.com')
    .option('-a, --address <value>', 'Specify a domainname')
    .option('--defaults', 'Use the daplie nameservers and naming convention')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || !((opts.name && opts.address) || (opts.name && opts.defaults))) {
    program.help();
    console.log('');
    console.log('Examples:');
    console.log('    daplie glue:set --name ns1.example.com --address 127.0.0.1');
    console.log('    daplie glue:set --name example.com --defaults');
    console.log('');
    return;
  }

  return oauth3.Glue.set(opts).then(function (/*success*/) {
    console.log("");
    console.log("Success");
    console.log("");
  });
};

//
// NameServers
//
all.ns = function () {
  console.log("");
  console.log("Usage: daplie ns:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help ns:COMMAND" for more details:');
  console.log("");
  console.log("  ns:list        # show nameservers, same as `dig NS <domain>`");
  console.log("  ns:set         # set nameservers");
  console.log("");
};
all['ns:list'] = function () {
  program
    .usage('ns:list')
    .option('-n, --name <value>', 'Specify a domainname')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || !opts.name) {
    program.help();
    console.log('');
    console.log('Example: daplie ns:list --name example.com');
    console.log('');
    return;
  }

  return require('dns').resolveNs(opts.name, function (err, nameservers) {
    if (err) {
      console.error(err.toString());
      return;
    }

    console.log("");
    console.log("Nameservers for " + opts.name);
    console.log("-----------");
    console.log("");
    nameservers.forEach(function (ns) {
      console.log(ns);
    });
    console.log("");
  });
};
all['ns:set'] = function () {
  program
    .usage('ns:set')
    .option('-n, --name <value>', 'Specify a domainname')
    .option('--nameservers <values>', 'Comma-separated list of nameservers')
    .option('--defaults', 'Use the daplie nameservers')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme || !opts.name || !(opts.nameservers || opts.defaults)) {
    program.help();
    console.log('');
    console.log('Examples:');
    console.log('    daplie ns:set --name example.com --nameservers ns1.example.com,ns2.example.com');
    console.log('    daplie ns:set --name example.com --defaults');
    console.log('');
    return;
  }

  opts.nameservers = (opts.nameservers||'').split(',');

  return oauth3.Ns.set(opts).then(function (result) {
    console.log("");
    console.log(opts.name);
    console.log("");
    console.log("Nameservers");
    console.log("-----------");
    console.log("");
    result.nameservers.forEach(function (ns) {
      console.log(ns);
    });
    console.log("");
  });
};

//
// Wallet
//
all.wallet = function () {
  console.log("");
  console.log("Usage: daplie wallet:COMMAND [command-specific-options]");
  console.log("");
  console.log('Primary help topics, type "daplie help wallet:COMMAND" for more details:');
  console.log("");
  console.log("  wallet:sources:list      # show all funding sources");
  console.log("  wallet:sources:add       # add a new credit card");
  console.log("  wallet:sources:remove    # remove a credit card");
  console.log("  wallet:sources:update    # set the default (or the priority)");
  //console.log("  wallet:sources:default   # alias of wallet:sources:update --default");
  console.log("");
  return;
};

all['wallet:sources'] = all['wallet:sources:list'] = function () {
  var opts = mergeDefaults(program);

  listCards(opts, null);
};

all['wallet:sources:add'] = function () {
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

  var opts = mergeDefaults(program);
  if (helpme) {
    program.help();
    console.log('');
    console.log('Example: daplie wallet:sources:add');
    console.log('');
    return;
  }

  opts.ccPriority = opts.priority;
  opts.ccNick = opts.nick;
  opts.ccComment = opts.comment;
  oauth3.Cards.add(opts).then(function (card1) {
    return listCards(opts, card1);
  });
};

all['wallet:sources:update'] = function () {
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

  var opts = mergeDefaults(program);
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

  opts.ccPriority = opts.priority;
  opts.ccNick = opts.nick;
  opts.ccComment = opts.comment;
  if (opts.brand) {
    if ('amex' === opts.brand.toLowerCase()) {
      opts.brand = 'American Express';
    }
    else if ('mc' === opts.brand.toLowerCase()) {
      opts.brand = 'MasterCard';
    }
    else if ('disc' === opts.brand.toLowerCase()) {
      opts.brand = 'Discover';
    }
    else if (/^(dci|diner)/i.test(opts.brand)) {
      opts.brand = 'Diners Club';
    }
  }

  opts.provider = cliOptions.provider;
  oauth3.Cards.update(opts).then(function (/*updatedCard*/) {
    return listCards(opts, null);
  });
};

all['wallet:sources:remove'] = function () {
  program
    .usage('wallet:sources:remove --last4 <xxxx>')
    .option('--last4 <value>', 'Last 4 of credit card (xxxx-xxxx-xxxx-XXXXX)')
    .option('--brand <value>', 'Card brand (Visa, MC, AMEX, Disc, etc)')
    .option('--exp <value>', 'Card expiration (mm/yy)')
    //.option('--cc- <value>', '')
    .parse(process.argv)
  ;

  var opts = mergeDefaults(program);
  if (helpme) {
    program.help();
    console.log('');
    console.log("Example: daplie wallet:sources:remove --brand 'American Express' --last4 4321 --exp 01/35");
    console.log('');
    return;
  }

  if (opts.brand) {
    if ('amex' === opts.brand.toLowerCase()) {
      opts.brand = 'American Express';
    }
    else if ('mc' === opts.brand.toLowerCase()) {
      opts.brand = 'MasterCard';
    }
    else if ('disc' === opts.brand.toLowerCase()) {
      opts.brand = 'Discover';
    }
    else if (/^(dci|diner)/i.test(opts.brand)) {
      opts.brand = 'Diners Club';
    }
  }

  opts.provider = cliOptions.provider;
  return oauth3.Cards.remove(opts).then(function (/*deletedCard*/) {
    return listCards(opts, null);
  });
};

function run() {
  var p = all[cmd]();
  if (p && p.then) {
    p.then(function () {}, function (err) {
      console.error('Error: ');
      console.error(err.stack || err.message || err.toString());
    });
  }
}

if (all[cmd]) {
  run();
}
else {
  console.error("'" + cmd + "' Not Implemented Yet!");
}

process.on('unhandledRejection', function (err/*, p*/) {
  console.log("Possibly Unhandled Rejection at:");
  //console.log("Promise:");
  //console.error(p);
  //console.log("Error:");
  // same as p.then(..., function (err) { ... })
  console.error(err.stack || err);
  process.exit(1);
  // application specific logging here
});
