let net = require('net');
let JsonSocket = require('json-socket');

var port = process.env.PORT;
var server = net.createServer();

server.listen(port);
server.on('connection', function(socket) 
{
	console.log('connection!!!!!!');
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    socket.on('message', function(message) 
	{
        var result = message.a + message.b;
        socket.sendEndMessage({result: result});
    });
});

console.log('listening on port: ' + port);
console.log(server);