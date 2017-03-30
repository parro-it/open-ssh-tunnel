# open-ssh-tunnel

[![Greenkeeper badge](https://badges.greenkeeper.io/parro-it/open-ssh-tunnel.svg)](https://greenkeeper.io/)

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

    // later, when you want to close the tunnel
    server.close();
  }

```
### Example

```
╭───────────────╮      ╭─────────────────╮      ╭─────────╮      ╭─────────╮
│ Mongo         │      │ open-ssh-tunnel │      │ SSH     │      │ Mongo   │
│ client        │ <--> │                 │ <--> │ server  │ <--> │ server  │
│ 192.168.1.1   │      │ 192.168.1.2     │      │ 10.0.0.2│      │ 10.0.0.1│
│               │      │                 │      │         │      │         │
╰───────────────╯      ╰─────────────────╯      ╰─────────╯      ╰─────────╯
```

In scenario where you want to connect to `mongo` that runs on a remote host, you should provide the following configuration.

```js
{
    destPort: 27017,
    destAddr: '10.0.0.1',
    host: '10.0.0.2',
    port: 22,
    localAddr: 27018,
    localPort: '192.168.1.2',
    srcAddr: '192.168.1.1',
    srcPort: 27019,
    ...
}
```

Note that you have to provide __localAddr__ when you need to make the tunnel visible to other hosts in your LAN.

__srcAddr__ and __srcPort__, when provided, should be the network address of a client host connecting to your SSH tunnel local endpoint. If you do not need them you can provide any value for the arguments.

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
