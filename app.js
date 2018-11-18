var faye = require('faye'),
    http = require('http');

var bayeux = new faye.NodeAdapter({mount: '/'}),
    server = http.createServer();

bayeux.attach(http);
http.listen(8000);