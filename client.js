//client connect to tcp server localhost 8001
let fs = require('fs')
let jot = require('json-over-tcp')
let co = require('co')
let chokidar = require('chokidar')
let path = require('path')
let cwd = process.cwd()
const PORT = 8001
const HTTPPORT = 8000

// var net = require('net');
// var client = new net.Socket();
// client.connect(TCPPORT, '127.0.0.1', function() {
//   console.log('Connected');
//   client.write('Hello, server! Love, Client.');
// });

// client.on('data', function(data) {
//   console.log('Received: ' + data);
//   client.destroy(); // kill client after server's response
// });

// client.on('close', function() {
//   console.log('Connection closed');
// });

let client = jot.connect(PORT, function(){
    console.log('tcp connected...')
  })

  let watcher = chokidar.watch(cwd, {ignored: /[\/\\]\./, persistent: true})
  // Something to use when events are received.
   // let log = console.log.bind(console)
  // Add event listeners.
  watcher.on('add', (path) => { 
                let data = {"action": "write", "path": path, "type": "file" }
                socket.write(data)
              })
       .on('addDir', (path) => { 
                    let data = {"action": "write", "path": path, "type": "dir" }
                    socket.write(data)
                    })
       .on('change', (path) => {
                    let data = {"action": "write", "path": path, "type": "file"}
                    socket.write(data)
                    })
       .on('unlink', (path) => {
                    let data = {"action": "delete", "path": path,"type": "file" }
                    socket.write(data)
                    })
       .on('unlinkDir', (path) => {
                    let data = {"action": "delete", "path": path, "type": "dir"}
                    socket.write(data)
                    });
client.on('data', function(data){
    console.log('Received: ' + data);
    client.destroy()
})