# Daplie Tools

Taking Back the Internet!

https://daplie.com/articles/introducing-daplie/

That's what we're doing and that's what these tools are for.

## What can I do with 'em?

`daplie-tools` is a CLI suite of tools for managing Internet infrastructure:

* Manage Domains
  * purchaes your own domain
  * transfer from your current registrar
  * get a `daplie.me` subdomain

* Manage DNS
  * Glue Records
  * Domain Nameservers
  * Static Record Types (CNAME, MX, SRV, TXT)
  * Device (server) Record Types (A, AAAA)

* Dynamic DNS (DDNS)
  * Managed with Device API

(NAT automation and Reverse VPN purchase are planned for the future)

![](https://i.imgur.com/m5iOjTN.png)

# Install

This is **alpha software** (not quite beta yet).

We're intending this to be used by people that are happy to submit to us bug reports
and not give up when it doesn't work quite right.

(remember: computers are like people - no two are alike and although it works
as expected for everyone else, it will somehow fail for you)

**Minimal**

```bash
# install node.js 4.3 or greater
curl -sL bit.ly/nodejs-min | bash

# install daplie-tools
npm install -g daplie-tools
```

Note: you will need `curl` and `git` installed.

**With Development Tools**

```
# install node.js 4.3 or greater
curl -sL bit.ly/nodejs-dev-install -o node-dev; bash ./node-dev

# install daplie-tools
npm install -g daplie-tools
```

If you don't want to use the scripts you can always download node.js here: https://nodejs.org/en/download/
(but then you have to fix permissions on `/usr/local` and perhaps deal with quirks).

## Windows

**completely untested**

Download the installer from https://nodejs.org/en/download/

```bash
npm install -g daplie-tools
```

In theory it'll work. Let us know. :)

# Walkthroughs & FAQs

* How do I get a **`daplie.me` domain**?

* How do I **purchase a domain**?

* How do I **transfer a domain**?

* How do I use **Dynamic DNS** with **Raspberry Pi**, etc?

* How do I **Manage DNS** with **Digital Ocean, Azure, AWS**, etc?

* Why do you require a Credit Card and address information for `daplie.me` subdomains?

* I have **a lot of users**, How can I "resell" my domain as Dynamic DNS?

## Get a daplie.me subdomain

In short, you just enter the purchase console, type the domain you want, and end with `.daplie.me`:

```bash
daplie domains:search
```

![](http://i.imgur.com/U49NUpm.png)

Oh, and you can also script the domain purchase directly:

```bash
daplie help domains:search

daplie domains:search --domainnames "example.daplie.me" --tip 1 -max-purchase-price 1
```

Note: although we don't check right now, excessive use of daplie.me domains will be reclaimed.
If you have a large number of users you would like to supply domains for, email aj@daplie.com
and I'll help you get your own domain set up for your users.

## Purchase your own .com, .org, .net, etc

1. Open the purchase console
2. Type the name of the domain you want
3. If it is not available the price turn into `N/A`
4. Follow the prompts once you find an available domain

```bash
daplie domains:search
```

![](http://i.imgur.com/U49NUpm.png)

Oh, and you can also script the domain purchase directly:

```bash
daplie help domains:search

daplie domains:search --domainnames "example.daplie.me," --tip 1 -max-purchase-price 30
```

## Transfer a Domain

Before you can transfer a domain, there are a few things you need to do through
the company you bought it from:

1. You must **TURN OFF WHOIS PRIVACY**
2. You must **UNLOCK** your domain
3. You must get an **EPP Transfer Code** (the name may vary by registrar)
4. Copy your DNS records (copy and paste, screenshot, csv, whatever they offer)

Note: Usually your DNS records will remain active with your current company for
2 weeks or more, but don't forget to transfer them over.

With the EPP code you can perform the transfer in this format:

```bash
daplie domains:search --domainnames 'DOMAIN1:EPP1,DOMAIN2:EPP2'
```

Example:

```bash
daplie domains:search --domainnames 'example.com:^%efea$#!0,example.net:afe187e7cc'
```

1. It will take 1-10 days for the transfer to complete
2. You must update your nameservers once the transfer completes

Example:

```bash
daplie ns:set -n example.com --defaults
```

DO NOT DO THIS until you've copied the DNS records over (see the next section **Manage DNS**)

## Manage DNS with Servers (Digital Ocean, Azure, AWS, etc)

1. Set ip address to each device (names are arbitrary)
2. Set the device to corresponding domains
3. Set non-device records

```bash
daplie devices:set --device 'aws-west-1' --addresses '127.0.0.1,::1'

daplie devices:attach --device 'aws-west-1' -n 'example.com'

# Example setting up mailgun
daplie dns:set -n example.com --type MX --answer mxa.mailgun.org --ttl 3600
daplie dns:set -n example.com --type MX --answer mxb.mailgun.org --ttl 3600
daplie dns:set -n mail.example.com --type CNAME --answer mailgun.org --ttl 3600
```

Note: (ANAME and FWD records are not yet supported)

## Dyanmic DNS with Raspberry Pi, Router, cron, etc

1. Set ip address to each device (names are arbitrary)
2. Set the device to corresponding domains
3. Set non-device records

```bash
daplie devices:set --device 'rpi2' --addresses '127.0.0.1,::1'

daplie devices:attach --device 'rpi2' -n 'example.com'

daplie devices:token --device 'rpi2'
```

Now schedule `cron` to run `curl` with the url+token every 10 minutes or so.

Note: (A more conservitive `devices:update` method will be implemented soon)

## Why do we require a credit card?

Many of the popular free DNS services are blocked by corporate, government, and school
firewalls because of abuse from non-paying anonymous users.

In order to ensure that our service remains available to all of our users
we require a valid credit card and physical address as a method of
deterring abusive and/or malicious users.

## White-Label Subdomains and/or Dynamic DNS

You could offer your subdomains to your users in the same way that we offer `daplie.me` subdomains
for our users.

Right now that's a manual process. If you're interested contact aj@daplie.com.

# Commands

See [COMMANDS.md](COMMANDS.md)

# Authors

daplie-tools is developed by <a href="https://github.com/coolaj86">AJ ONeal.</a>

# Versioning

This is an Alpha, so we really just bump the build version.

When it goes into RC is when we'll try to keep all of the command flags the same so that scripts you build won't break.

The format is: `v<major.minor.patch>-<class>+<build>`

More information avaliable at <a href="http://semver.org"> http://semver.org/</a>

# License

`daplie-tools` is licensed under the <a href="https://spdx.org/licenses/MPL-2.0">MPLv2</a> license.
