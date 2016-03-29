//client connect to tcp server localhost 8001
let fs = require('fs')
let jot = require('json-over-tcp')
let co = require('co')
let chokidar = require('chokidar')
let path = require('path')
let cwd = process.cwd()
const PORT = 8001
const HTTPPORT = 8000
let argv = require('yargs').argv
let defaultPath = path.resolve(path.join(cwd, 'client')) || argv.dir   // enable pass in --dir
let StringBuilder = require('stringbuilder')
let net = require('net')
// let client = new net.Socket()
let httpClient = new net.Socket()

let client = jot.connect(PORT, '127.0.0.1', function() {
  console.log('Connected tcp server...');
})


client.on('data', function(data) {
  console.log('Received: ' + data)
  // client.destroy(); // kill client after server's response
  let raw_request = buildRequest(data)
  httpClient.connect(HTTPPORT, '127.0.0.1', function(){
    console.log('sending http request...' + raw_request)
    httpClient.write(raw_request)
  })
})

function buildRequest(data){
  let sb = new StringBuilder({newline:'\r\n'})
  console.log('sb: ' + sb)
  console.log(data.action.toString())
  console.log(data.action === 'PUT')
  let tmpRequest = " http://127.0.0.1:8000" + data.path.replace('server', 'client')
  if(data.action === 'GET'){
    // sb.append('GET')
    if(data.type === 'dir'){
      //for folder.. add ACCEPT header to enable archive
    }
  }
  // else if(data.action === 'PUT'){
  //   sb.append('PUT')
  // }else if(data.action === 'POST'){
  //   sb.append('POST')
  // }else{
  //   sb.append('DELETE')
  // }
  // sb.append(tmpRequest)
  console.log('raw_request: '+ data.action + tmpRequest)
  // console.log('raw_request: '+sb)
  return data.action + tmpRequest
}

// client.on('close', function() {
//   console.log('Connection closed');
// });
