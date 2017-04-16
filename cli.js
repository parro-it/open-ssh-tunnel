'use strict';

const argv = require('yargs').argv;
const sshTunnel = require('./');

const openTunnel = sshTunnel.openTunnel;

const defaults = {
	srcAddr: '127.0.0.1',
	dstAddr: '127.0.0.1',
	readyTimeout: 13000,
	forwardTimeout: 13000,
	localAddr: '127.0.0.1'
};
const options = Object.assign({}, defaults, argv);

openTunnel(options)
	.then(() => {
		process.stdout.write('Tunnel opened\n');
	})
	.catch(err => process.stdout.write(err.message + '\n'));
