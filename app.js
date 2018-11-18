let express = require('express');
let faye = require('faye');
let http = require('http');

let app = express();
let server = http.createServer(app);
let bayeux = new faye.NodeAdapter({mount: '/messages', timeout: 45});

let port = process.env.PORT || 8000;

bayeux.attach(server);

bayeux.on('handshake', function(clientId) {
    console.log('Client connected', clientId);
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

var client = new Faye.Client('http://localhost:3000/faye');

client.subscribe('/messages', function (newMessage) {
  console.log("New Message: ", newMessage);
});