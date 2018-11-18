let faye = require('faye');
let http = require('http');

let bayeux = new faye.NodeAdapter({mount: '/'});
let server = http.createServer();

bayeux.attach(http);
http.listen(8000);