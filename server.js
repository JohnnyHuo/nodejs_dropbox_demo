#!/usr/bin/env node --use_strict

require('./helper')
let path = require('path')
let originalFs = require('fs')
let fs = require('fs').promise
let express = require('express')
let morgan = require('morgan')
let trycatch = require('trycatch')
let wrap = require('co-express')
let bodyParser = require('simple-bodyparser')
let archiver = require('archiver')
let mime = require('mime')
let rimraf = require('rimraf')
let argv = require('yargs').argv
let cwd = argv.dir || process.cwd()

function* main(){
	let app = express()
    app.use(morgan('dev'))
    app.use((req, res, next) => {
        trycatch(next, e => {
            console.log(e.stack)
            res.writeHead(500)
            res.end(e.stack)
        })
    })
	app.listen(8000)
	app.get('*//', wrap(sendHeaders), wrap(getFolder))
	app.put('*//', wrap(createFolder))
	app.post('*//', wrap(updateFolder))
	app.delete('*//', wrap(delFolder))
	app.get('*', wrap(sendHeaders), wrap(read))
	app.put('*', wrap(write))
	app.post('*', wrap(update))
	app.delete('*', wrap(del))
}

function* delFolder(req, res){
	let filePath = path.join(cwd, req.url)
	console.log('deleting folder...' + filePath)
	try{
		let stat = yield fs.stat(filePath)
		console.log(stat)
		if(stat){
			console.log('Located folder...')
			rimraf(filePath, function(error){
				console.log('Error: ', error)
			})
			res.end('Deleted folder! \n')
		}
	}catch(e){//invalid path
		console.log(e.stack)
		res.status(405).send('Invalid Path! \n')
	}
	// rimraf(path.join(ROOT_DIR, filePath))
}

function* updateFolder(req, res){
	console.log('updating folder...')
	res.status(405).send('Method NOT Allowed! \n')
}

function* createFolder(req, res){
	let filePath = path.join(cwd, req.url)
	try{
		console.log('creating folder...')
		console.log(filePath)
		let stat = yield fs.stat(filePath)
		res.status(405).send('Folder already exist... \n')
	}catch (e){//folder not exist, create new
		console.log('folder not exist...')
		yield fs.mkdir(filePath)
		res.end('Folder created \n')
	}
}

function* getFolder(req, res){
	console.log('Fetching folder info...')
	let filePath = path.join(cwd, req.url)
	console.log(filePath)
	try{
		let stat = yield fs.stat(filePath)
		console.log('finish stat')
		console.log(stat)
		let files = yield fs.readdir(filePath)
		console.log(files.toString())
		console.log('files to json: ' + JSON.stringify(files))
		res.end(JSON.stringify(files))
	}catch(e){//folder not exist
		res.status(405).send('Folder not exist. \n')
	}
}


function* del(req, res){
	let filePath = path.join(cwd, req.url)
	try{
		let stat = yield fs.stat(filePath)
		if(stat){
			yield fs.unlink(filePath)
			res.end()
		}
	}catch (e) {
		console.log('file not exist...')
		res.status(405).send('File not exist. Delete Method Not Allowed. \n')
	}
}


function* update(req, res){
	console.log('updating...')
	let filePath = path.join(cwd, req.url)
	try{
		let stat = yield fs.stat(filePath)
		if(stat){
			yield fs.truncate(filePath)
			let options = {
			  flags: 'w+',
			  defaultEncoding: 'utf8',
			  autoClose: true
			}
			let createWriteStream = originalFs.createWriteStream
			let writeStream = createWriteStream(filePath, options)
			req.pipe(writeStream)
			res.end()
		}
	}catch (e) {
		console.log('file not exist...')
		res.status(405).send('File not exist. Method Not Allowed. \n')
	}
}


function* write(req, res){
	let filePath = path.join(cwd, req.url)
	try{
		let stat = yield fs.stat(filePath)
		if(stat){
			res.status(405).send('File exists. Method Not Allowed. \n')
		}
	}catch (e) {
		console.log('file not exist...')
		let options = {
		  flags: 'w+',
		  defaultEncoding: 'utf8',
		  autoClose: true
		}
		let createWriteStream = originalFs.createWriteStream
		let writeStream = createWriteStream(filePath, options)
    	req.pipe(writeStream)
    	res.end()
	}
}

function* read(req, res) {
	console.log('reading...')
    let filePath = path.join(cwd, req.url)
    console.log('filePath is ' + filePath)
    let options = {
		  flags: 'r',
		  defaultEncoding: 'utf8',
		  autoClose: true
		}
    let readStream = originalFs.createReadStream(filePath, options)
    console.log(readStream.on)
	readStream.pipe(res)
}

function* sendHeaders(req, res, next) {
    console.log('sending headers')
    let filePath = path.join(cwd, req.url)
    console.log(filePath)
    try{
	    let stats = yield fs.stat(filePath)
	    console.log(stats)
	    if(stats.isDirectory()){
	    	console.log('Sending header for directory...')
	    	let files = yield fs.readdir(filePath)
	    	console.log(files.toString())
	    	res.body = JSON.stringify(files)
	    	res.setHeader('Content-Length', res.body.length)
	    	res.setHeader('Content-Type', 'application/json')
	    }else{
		    res.set('Content-Length',stats["size"].toString())
		    res.set('Content-Type',mime.lookup(filePath))
	    }
	    next()
	}catch(e){
		console.log(e.stack)
		res.status(405).send('Invalid Path \n')
	}
}

module.exports = main