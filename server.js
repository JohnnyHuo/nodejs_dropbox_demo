//server monitor the file system, if any change, send tcp request to client, and client will send http request to crud.js to sync the file status
let fs = require('fs')
let jot = require('json-over-tcp')
let co = require('co')
let chokidar = require('chokidar')
let path = require('path')
let cwd = process.cwd()
let argv = require('yargs').argv
// const defaultPath = cwd+'/server/'
const defaultPath = cwd+'/files/'

console.log('TCP server cwd: ' + cwd)
const PORT = 8001
let listenPath = cwd || argv.dir

let server = jot.createServer(PORT);
server.on('listening', createConnection);
server.on('connection', newConnectionHandler);


function newConnectionHandler(socket){
	console.log('tcp server get connection...')

	let watcher = chokidar.watch(defaultPath, {ignored: /[\/\\]\./, persistent: true})

	let log = console.log.bind(console)
	//listen on changes
	watcher.on('add', (path) => { 
								let data = {"action": "WRITE", "path": path, "type": "file" }
								socket.write(data)})

    watcher.on('addDir', (path) => { 
       							let data = {"action": "WRITE", "path": path, "type": "dir" }
       							socket.write(data)})

    watcher.on('change', (path) => {
       							let data = {"action": "WRITE", "path": path, "type": "file"}
       							socket.write(data)})

    watcher.on('unlink', (path) => {
       							let data = {"action": "DELETE", "path": path,"type": "file" }
       							socket.write(data)})

    watcher.on('unlinkDir', (path) => {
       							let data = {"action": "DELETE", "path": path, "type": "dir"}
       							socket.write(data)})
}

function createConnection(){
	let socket = jot.connect(PORT, function(){
	})

	socket.on('data', function(data){
    	operateData(data)
  	})
}

let operateData = co.wrap(function* (data){
	console.log(data)
	let fromPath = data.path
	let toPath = fromPath.replace('server', 'client')
	console.log('From: ' , fromPath)
	console.log('To: ', toPath)
	if(fs.stat(fromPath).isDirectory()){
		console.log('working on folder')
	}else{
		console.log('syncing...')
		if(data.action == 'WRITE'){
			let readStream = fs.createReadStream(fromPath)
			let writeStream = fs.createWriteStream(toPath)
			readStream.pipe(writeStream)
		}else{// delete
			yield fs.unlink(destPath)
		}
	}
})


server.listen(PORT);
