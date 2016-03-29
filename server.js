let net = require('net')
let JsonSocket = require('json-socket')
let port = 8001
let server = net.createServer()
server.listen(port)
server.on('connection', function(socket) {
    socket = new JsonSocket(socket) //Now we've decorated the net.Socket to be a JsonSocket
    socket.on('message', function(message) {
        let result = message.a + message.b
        socket.sendEndMessage({result: result})
    })
})