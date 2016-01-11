'use strict';

const test = require('tape');
const sshTunnel = require('./');
const openTunnel = sshTunnel.openTunnel;
const ssh = require('ssh2');
const Server = ssh.Server;
const fs = require('fs');
const http = require('http');
const co = require('co');
const HOST_KEY_RSA = fs.readFileSync(__dirname + '/fixtures/ssh_host_rsa_key');

const config = {
  host: '127.0.0.1',
  port: 2222,
  username: 'USERNAME',
  password: 'PASSWORD',
  srcPort: 4000,
  srcAddr: '127.0.0.1',
  dstPort: 4000,
  dstAddr: '127.0.0.1',
  readyTimeout: 3000,
  forwardTimeout: 3000,
  localPort: 8000,
  localAddr: '127.0.0.1'
};

const server = new Server({
  privateKey: HOST_KEY_RSA,
  username: 'USER',
  password: 'PASSWORD'
});

let httpServer;

test('start ssh test server', t => {

  server.on('connection', conn => {
    conn.on('authentication', ctx => ctx.password === 'PASSWORD' ? ctx.accept() : ctx.reject());
    conn.on('request', accept => accept());
    conn.on('tcpip', accept => accept());
  });

  server.listen(2222, '127.0.0.1', function() {
    t.equal(this.address().port, 2222);

    httpServer = http.createServer((request, response) => {
      response.end('It Works!! Path Hit: ' + request.url);
    });

    httpServer.listen(4000, () => {
      t.end();
    });
  });

});

test('open an ssh forward', t => {
  openTunnel(config)
    .then(tunnelStream => {
      t.equal(typeof tunnelStream.pipe, 'function');
      tunnelStream.close();
      t.end();
    })
    .catch(err => t.end(err));
});


test('open an ssh tunnel', t => {
  sshTunnel(config)
    .then(server2 => {
      t.equal(typeof server.close, 'function');
      server2.close();
      t.end();
    })
    .catch( err => t.end(err));
});


test('fails on bad password', t => {
  sshTunnel(Object.assign({}, config, {password: 'picchio'}))
    .then(() => {
      t.fail('Exception expected');
    })
    .catch(err => {
      t.equal(err.message, 'All configured authentication methods failed');
      t.end();
    });
});


test('fails on bad port', t => {
  sshTunnel(Object.assign({}, config, {
    srcPort: 12,
    dstPort: 13,
    localPort: 14
  }))
  .then(() => {
    t.fail('Exception expected');
  }).catch(err => {
    t.equal(err.message, 'listen EACCES 127.0.0.1:14');
    t.end();
  });
});


test('fails on local port already binded', co.wrap(function * (t) {
  const serv = yield sshTunnel(config);

  sshTunnel(config).then(() => {
    t.fail('Exception expected');
  }).catch(err => {
    t.equal(err.message, 'listen EADDRINUSE 127.0.0.1:8000');
    serv.close();
    t.end();
  });
}));


test('fails on bad host', t => {
  sshTunnel(Object.assign({}, config, {host: '192.168.234.1'}))
  .then(() => {
    t.fail('Exception expected');
  }).catch(err => {
    t.equal(err.message, 'Timed out while waiting for handshake');
    t.end();
  });
});

test('end server', t => {
  server.close();
  httpServer.close();
  t.end();
});
