let http = require('http');
let socket = require('socket.io');

let app = http.createServer(server);
let io = socket(app);
app.listen(process.env.PORT);



function server(req,res)
{
    console.log('A user tried to connect to mazeserver.localtunnel.me'+req.url)
    if(req.url == '/'){
        console.log('Sending html...');
        res.writeHead(200, {"Context-Type":"text/html"});
        fs.createReadStream('./index.html').pipe(res);
    }else if(req.url == '/pong.js'){
        console.log('Sending JS...');
        res.writeHead(200, {"Context-Type":"text/JavaScript"});
        fs.createReadStream('./pong.js').pipe(res);
    }else {
        console.log('Error 404: file .'+req.url+' not found');
        res.writeHead(404, {"Context-Type":"text/html"});
        fs.createReadStream('./404.html').pipe(res);
    }
}

console.log('listening on port: ' + process.env.PORT);