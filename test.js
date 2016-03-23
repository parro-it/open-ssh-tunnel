'use strict';

const test = require('tape-async');
const sshTunnel = require('./');
const openTunnel = sshTunnel.openTunnel;
const ssh = require('ssh2');
const Server = ssh.Server;
const fs = require('fs');
const http = require('http');
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

test('open an ssh forward', function * (t) {
  const tunnelStream = yield openTunnel(config);
  t.equal(typeof tunnelStream.end, 'function');
  tunnelStream.end();
});


test('open an ssh tunnel', function * (t) {
  const server2 = yield sshTunnel(config);
  t.equal(typeof server.close, 'function');
  server2.close();
});


test('fails on bad password', function * (t) {
  try {
    yield sshTunnel(Object.assign({}, config, {password: 'picchio'}));
    t.fail('Exception expected');
  } catch (err) {
    t.equal(err.message, 'All configured authentication methods failed');
  }
});


test('fails on bad port', function * (t) {
  try {
    yield sshTunnel(Object.assign({}, config, {
      srcPort: 12,
      dstPort: 13,
      localPort: 14
    }));
    t.fail('Exception expected');
  } catch (err) {
    t.equal(err.message, 'listen EACCES 127.0.0.1:14');

  }
});


test('fails on local port already binded', function * (t) {
  const serv = yield sshTunnel(config);
  try {
    yield sshTunnel(config);
    t.fail('Exception expected');
  } catch (err) {
    t.equal(err.message, 'listen EADDRINUSE 127.0.0.1:8000');
    serv.close();
  }
});


test('fails on bad host', function * (t) {
  try {
    yield sshTunnel(Object.assign({}, config, {host: '192.168.234.1'}));
    t.fail('Exception expected');
  } catch (err) {
    t.equal(err.message, 'Timed out while waiting for handshake');
  }
});

test('end server', () => {
  server.close();
  httpServer.close();
});
