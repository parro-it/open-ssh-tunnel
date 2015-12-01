'use strict';

const net = require('net');
const ssh2 = require('ssh2');
const debug = require('debug')('open-ssh-tunnel');
const co = require('co');

function openTunnel(options) {
  const tunnel = new ssh2.Client();
  tunnel.on('end', () => {
    debug('ssh tunnel is closed.');
  });

  return new Promise((resolve, reject) => {
    tunnel.on('error', err => {
      reject(err);
    });

    tunnel.on('ready', () => {
      debug('ssh tunnel is ready.');
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        reject(new Error('Timed out while waiting for forwardOut'));
      }, options.forwardTimeout);

      tunnel.forwardOut(
        options.srcAddr,
        options.srcPort,
        options.dstAddr,
        options.dstPort,
        (err, stream) => {
          if (timedOut) {
            tunnel.end();
            return null;
          }

          clearTimeout(timeout);

          if (err) {
            tunnel.end();
            return reject(err);
          }

          debug('port forward stream is ready.');
          stream.on('close', () => {
            debug('port forward stream is closed.');
            tunnel.end();
          });

          resolve(stream);
        }
      );
    });
    tunnel.connect(options);
  });
}

function * createClientServer(options) {
  const testTunnel = yield openTunnel(options);
  testTunnel.close();

  const server = net.createServer( co.wrap(function * (connection) {
    const stream = yield openTunnel(options);
    connection.pipe(stream).pipe(connection);
    debug('tunnel pipeline created.');
  }));

  yield new Promise(resolve => {
    server.listen(options.localPort, options.localAddr, resolve);
  });

  debug('local tcp server listening.');
  return server;
}


module.exports = co.wrap(createClientServer);
module.exports.openTunnel = openTunnel;
