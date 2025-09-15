const express = require('express');
const app = express();
const PORT = 3000;

const server = require('http').createServer();

// Keep track of active connections
const connections = new Set();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
})

server.on('request', app);

// Track connections
server.on('connection', (connection) => {
  connections.add(connection);
  connection.on('close', () => {
    connections.delete(connection);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


// Begin web sockets
const webSocketServer = require('ws').Server;
const wss = new webSocketServer({ server });

process.on('SIGINT', () => {
    isShuttingDown = true;
    console.log('Shutting down server...');

    wss.clients.forEach(function each(client) {
        if (client.readyState === client.OPEN) {
            client.close(1000, 'Server shutting down');
        }
    });

    wss.close(() => {
        console.log('WebSocket server closed');

        for (const connection of connections) {
            connection.destroy();
        }

        server.close(() => {
            console.log('HTTP server closed');
            shutdownDB();
        });
    });
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.emit('SIGINT');
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
}

wss.on('connection',  function connection(ws){
    const numberOfClients = wss.clients.size;
    console.log(`New client connected. Total clients: ${numberOfClients}`);

    
    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome new client!');
        wss.broadcast(`Current visitors: ${numberOfClients}`);
    }

    db.run(`
        INSERT INTO visitors (count, time)
        VALUES (${numberOfClients}, datetime('now'))
    `)

    ws.on('close', () => {
        wss.broadcast(`Current visitors: ${wss.clients.size}`);
        console.log('A Client disconnected');
    });
});

/**End web sockets */
/**Begin database */
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
          count INTEGER,    
          time TEXT
        )
    `);
})

function getCounts() {
    db.each('SELECT * FROM visitors', (err, row) => {
        console.log(row)
    })
}

function shutdownDB() {
    console.log('Shutting down database');
    getCounts();
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database closed successfully');
        }
        process.exit(0);
    });
}
