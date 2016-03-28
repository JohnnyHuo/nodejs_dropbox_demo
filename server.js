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
let mime = require('mime')
let cwd = process.cwd()

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
	app.get('*', wrap(sendHeaders), wrap(read))
	app.put('*', wrap(write))
	app.post('*', wrap(update))
	app.delete('*', wrap(del))
}

function* del(req, res){
	let filePath = path.join(cwd, 'files', req.url)
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
	let filePath = path.join(cwd, 'files', req.url)
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
	let filePath = path.join(cwd, 'files', req.url)
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
    let filePath = path.join(cwd, 'files', req.url)
    console.log('filePath is ' + filePath)
    let options = {
		  flags: 'r',
		  defaultEncoding: 'utf8',
		  autoClose: true
		}
    let readStream = originalFs.createReadStream(filePath, options)
    console.log(readStream.on)
	readStream.pipe(res)
	// res.end()
}

function* sendHeaders(req, res, next) {
    // send headers logic
    console.log('sending headers')
    let filePath = path.join(cwd, 'files', req.url)
    let stats = yield fs.stat(filePath)
    let data = yield fs.readFile(filePath)
    res.set('Content-Type',mime.lookup(filePath))
    // res.set('Content-Length',stats["size"].toString())
    res.set('Content-Length',data.length)
    next()
}

module.exports = main