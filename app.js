let express = require('express');
let faye = require('faye');
let http = require('http');

let app = express();
let server = http.createServer(app);
let bayeux = new faye.NodeAdapter({mount: '/'});

let port = process.env.PORT || 8000;

bayeux.attach(server);

bayeux.on('handshake', function(clientId) {
    console.log('Client connected', clientId);
});

bayeux.on('message', function(message) {
	console.log('message...');
	console.log(message);
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/test.html');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500);
});

server.listen(port, function() {
    console.log('Listening on ' + port);
});