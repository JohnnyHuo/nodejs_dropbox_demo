//server monitor the file system, if any change, send tcp request to client, and client will send http request to crud.js to sync the file status
let fs = require('fs')
let jot = require('json-over-tcp')
let co = require('co')
let chokidar = require('chokidar')
let path = require('path')
let cwd = process.cwd()
console.log('TCP server cwd: ' + cwd)
const PORT = 8001

let server = jot.createServer(PORT);
// server.on('listening', startMonitor);
server.on('connection', newConnectionHandler);


// function startMonitor(){
// 	let watcher = chokidar.watch(cwd, {ignored: /[\/\\]\./, persistent: true})
// 	// Something to use when events are received.
// 	 let log = console.log.bind(console)
// 	// Add event listeners.
// 	watcher.on('add', (path) => { 
// 								let data = {"action": "write", "path": path, "type": "file" }
// 								socket.write(data)})
//     watcher.on('addDir', (path) => { 
//        							let data = {"action": "write", "path": path, "type": "dir" }
//        							socket.write(data)})
//     watcher.on('change', (path) => {
//        							let data = {"action": "write", "path": path, "type": "file"}
//        							socket.write(data)})
//     watcher.on('unlink', (path) => {
//        							let data = {"action": "delete", "path": path,"type": "file" }
//        							socket.write(data)})
//     watcher.on('unlinkDir', (path) => {
//        							let data = {"action": "delete", "path": path, "type": "dir"}
//        							socket.write(data)})

// }
function newConnectionHandler(socket){
	console.log('tcp server get connection...')

	let watcher = chokidar.watch(cwd+'/server/', {ignored: /[\/\\]\./, persistent: true})

	let log = console.log.bind(console)

	watcher.on('add', (path) => { 
								let data = {"action": "write", "path": path, "type": "file" }
								socket.write(data)})

    watcher.on('addDir', (path) => { 
       							let data = {"action": "write", "path": path, "type": "dir" }
       							socket.write(data)})

    watcher.on('change', (path) => {
       							let data = {"action": "write", "path": path, "type": "file"}
       							socket.write(data)})

    watcher.on('unlink', (path) => {
       							let data = {"action": "delete", "path": path,"type": "file" }
       							socket.write(data)})

    watcher.on('unlinkDir', (path) => {
       							let data = {"action": "delete", "path": path, "type": "dir"}
       							socket.write(data)})
}

let ops = co.wrap(function* (data) {
  let filePath = path.join(sourcePath, 'client', data.path)
  let destPath = path.join(sourcePath, 'server', data.path)
  if(data.action === 'write') {
    let rs = fs.createReadStream(srcPath)
    let ws = fs.createWriteStream(destPath)
    rs.pipe(ws)
  } else if('delete' == data.action) {
    yield fs.unlink(destPath)
  }
})

server.listen(PORT);
