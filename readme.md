# open-ssh-tunnel

> Easy ssh tunneling function based on [ssh2 library](https://github.com/mscdex/ssh2)

> Inspired by [tunnel-ssh](https://github.com/Finanzchef24-GmbH/tunnel-ssh), but with simplified, more modern code.

[![Travis Build Status](https://img.shields.io/travis/parro-it/open-ssh-tunnel.svg)](http://travis-ci.org/parro-it/open-ssh-tunnel)
[![NPM module](https://img.shields.io/npm/v/open-ssh-tunnel.svg)](https://npmjs.org/package/open-ssh-tunnel)
[![NPM downloads](https://img.shields.io/npm/dt/open-ssh-tunnel.svg)](https://npmjs.org/package/open-ssh-tunnel)

## Installation

```bash
npm install --save open-ssh-tunnel
```

## Usage

```js
  const openSshTunnel = require('open-ssh-tunnel');
  async function openATunnel() {
    const server = await openSshTunnel({
      host: 'your.server.address.com',
      username: 'you',
      password: 'secret',
      srcPort: 3306,
      srcAddr: '127.0.0.1',
      dstPort: 3306,
      dstAddr: '127.0.0.1',
      readyTimeout: 1000,
      forwardTimeout: 1000,
      localPort: 3306,
      localAddr: '127.0.0.1'
    });

    // you can now connect to your
    // forwarded tcp port!

    // later, when you wnat to lcose the tunnel
    server.close();
  }

```

## API

The module exports `openSshTunnel` function. It return a promise that resolve
to a node net server instance if tunnel is opened, otherwise is rejected with an error.

### Options

* __srcIP__ and __srcPort__ as the originating address and port and __dstIP__ and __dstPort__ as the remote destination address and port. These are options passed to [ssh2 `Client.forwardOut` method](https://github.com/mscdex/ssh2/blob/master/README.md#api).

* forwardTimeout - How many millisecond to wait before reject with a timeout error.

* __localAddr__ and __localPort__ are the address and port of the local endpoint of the tunnel on your machine. They are passed to net server connect method.

* All other options are passed to [ssh2 `Client.connect` method](https://github.com/mscdex/ssh2/blob/master/README.md#api).


## Related

* [electron-tunnel](https://github.com/parro-it/tunnels) - Awesome Electron app to manage your ssh tunnels - powered by this module.



## License

The MIT License (MIT)

Copyright (c) 2015 parro-it
