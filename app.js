let express = require('express');
let SocketServer = require('ws').Server;
let path = require('path');

let PORT = process.env.PORT || 3000;
let INDEX = path.join(__dirname, 'index.html');

let server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

let wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);