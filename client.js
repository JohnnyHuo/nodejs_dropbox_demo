// //client connect to tcp server localhost 8001
// let fs = require('fs')
// let jot = require('json-over-tcp')
// let co = require('co')
// let chokidar = require('chokidar')
// let path = require('path')
// let cwd = process.cwd()
// const PORT = 8001
// const HTTPPORT = 8000
// let http = require('http')
// let argv = require('yargs').argv
// let defaultPath = path.resolve(path.join(cwd, 'client')) || argv.dir   // enable pass in --dir
// let StringBuilder = require('stringbuilder')
// let net = require('net')
// // let client = new net.Socket()
// let httpClient = new net.Socket()
// let unirest = require('unirest')

// let client = jot.connect(PORT, '127.0.0.1', function() {
//   console.log('Connected tcp server...');
// })

// client.on('data', function(data) {
//   sendHttpRequest(data)
// })

// function sendHttpRequest(data){
//   console.log(data)
//   let url = 'http://127.0.0.1/8000'+ data.path
//   console.log('url : ', url)
//   if(data.action === 'PUT'){
//     if(data.type === 'file'){
//       let options = {
//           host: '127.0.0.1',
//           path: data.path,
//           //since we are listening on a custom port, we need to specify it by hand
//           port: '8000',
//           //This is what changes the request to a POST request
//           method: 'GET'
//         }
//       let req = http.request(options, function(response){
//         console.log('response body .....', response.body)
//         console.log('Defaultpath ', defaultPath)
//         let newOp = {
//           host: '127.0.0.1',
//           path: defaultPath,
//           //since we are listening on a custom port, we need to specify it by hand
//           port: '8000',
//           //This is what changes the request to a POST request
//           method: 'PUT',
//           body: response.body
//         }
//         http.request(options, function(response){
//           console.log('put request sent')
//         })
//       })

//     }else{//folder
//       let folderUrl = 'http://127.0.0.1/8000' + data.path.replace('server', 'client')
//       unirest.put()
//     }
    
//   }
// }


// // function buildRequest(data){
// //   let sb = new StringBuilder({newline:'\r\n'})
// //   console.log('sb: ' + sb)
// //   console.log(data.action.toString())
// //   console.log(data.action === 'PUT')
// //   let tmpRequest = " http://127.0.0.1:8000" + data.path.replace('server', 'client')
// //   if(data.action === 'GET'){
// //     // sb.append('GET')
// //     if(data.type === 'dir'){
// //       //for folder.. add ACCEPT header to enable archive
// //     }
// //   }
// //   // else if(data.action === 'PUT'){
// //   //   sb.append('PUT')
// //   // }else if(data.action === 'POST'){
// //   //   sb.append('POST')
// //   // }else{
// //   //   sb.append('DELETE')
// //   // }
// //   // sb.append(tmpRequest)
// //   console.log('raw_request: '+ data.action + tmpRequest)
// //   // console.log('raw_request: '+sb)
// //   return data.action + tmpRequest
// // }

// // client.on('close', function() {
// //   console.log('Connection closed');
// // });
