//server monitor the file system, if any change, send tcp request to client, and client will send http request to crud.js to sync the file status
let fs = require('fs')
let jot = require('json-over-tcp')
let co = require('co')
let chokidar = require('chokidar')
let path = require('path')
let cwd = process.cwd()
let argv = require('yargs').argv
const defaultPath = cwd+'/server/'

console.log('TCP server cwd: ' + cwd)
const PORT = 8001
let listenPath = cwd || argv.dir

let server = jot.createServer(PORT);
// server.on('listening', startMonitor);
server.on('connection', newConnectionHandler);


function newConnectionHandler(socket){
	console.log('tcp server get connection...')

	let watcher = chokidar.watch(defaultPath, {ignored: /[\/\\]\./, persistent: true})

	let log = console.log.bind(console)
	
	// //firstly sync client folder and server folder
	// let data = {"action" : "GET", "path" : path}
	// socket.write(data)

	//listen on changes
	watcher.on('add', (path) => { 
								let data = {"action": "PUT", "path": path, "type": "file" }
								socket.write(data)})

    watcher.on('addDir', (path) => { 
       							let data = {"action": "PUT", "path": path, "type": "dir" }
       							socket.write(data)})

    watcher.on('change', (path) => {
       							let data = {"action": "POST", "path": path, "type": "file"}
       							socket.write(data)})

    watcher.on('unlink', (path) => {
       							let data = {"action": "DELETE", "path": path,"type": "file" }
       							socket.write(data)})

    watcher.on('unlinkDir', (path) => {
       							let data = {"action": "DELETE", "path": path, "type": "dir"}
       							socket.write(data)})
}

server.listen(PORT);
