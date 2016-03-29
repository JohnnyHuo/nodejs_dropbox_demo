//client connect to tcp server localhost 8001
let fs = require('fs')
let jot = require('json-over-tcp')
let co = require('co')
let chokidar = require('chokidar')
let path = require('path')
let cwd = process.cwd()
const PORT = 8001
const HTTPPORT = 8000

var net = require('net');
var client = new net.Socket();

client.connect(PORT, '127.0.0.1', function() {
  console.log('Connected');
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  // client.destroy(); // kill client after server's response
});

// client.on('close', function() {
//   console.log('Connection closed');
// });
