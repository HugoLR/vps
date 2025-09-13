// const http = require('http');
// const PORT = 3000;

// const server = http.createServer((req, res) => {
//   res.write("On the way to beign a full stack engineer!");
//   res.end();	
// });

// server.listen(PORT);
// console.log("Server started on port 3000");

const express = require('express');
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