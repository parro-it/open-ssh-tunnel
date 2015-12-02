const test = require('tape');
const sshTunnel = require('./');
const openTunnel = sshTunnel.openTunnel;

const config = {
  host: 'freebsd.unixssh.com',
  username: 'parroit',
  password: process.env.UNIXSSH_PWD,
  srcPort: 3306,
  srcAddr: '127.0.0.1',
  dstPort: 3306,
  dstAddr: '127.0.0.1',
  readyTimeout: 3000,
  forwardTimeout: 3000,
  localPort: 3306,
  localAddr: '127.0.0.1'
};

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
    .then( server => {
      t.equal(typeof server.close, 'function');
      server.close();
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
    srcPort: 33,
    dstPort: 33,
    localPort: 33
  }))
  .then(() => {
    t.fail('Exception expected');
  }).catch(err => {
    t.equal(err.message, 'Timed out while waiting for forwardOut');
    t.end();
  });
});


test('fails on bad host', t => {
  sshTunnel(Object.assign({}, config, {host: '192.168.234.1'}))
  .then(() => {
    t.fail('Exception expected');
  }).catch(err => {
    t.equal(err.message, 'Timed out while waiting for handshake');
    t.end();
  });
});
