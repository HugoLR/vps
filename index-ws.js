const express = require('express');
const { connect } = require('http2');
const app = express();
const PORT = 3000;

const server = require('http').createServer();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
})

server.on('request', app);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Begin web sockets
const webSocketServer = require('ws').Server;
const wss = new webSocketServer({ server });

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === client.OPEN) {
            client.send(data);
        }
    });
}

wss.on('connection',  function connection(ws){
    const numberOfClients = wss.clients.size;
    console.log(`New client connected. Total clients: ${numberOfClients}`);

    
    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome new client!');
        wss.broadcast(`Current visitors: ${numberOfClients}`);
    }

    ws.on('close', () => {
        console.log('A Client disconnected');
    });
});

