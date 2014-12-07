var path = require('path');
var express = require('express');
var http = require('http');
var WSServer = require('ws').Server;
var Game = require('./lib/game');

var PORT = process.env.PORT || 5000;

var game = new Game(undefined, undefined);
var app = express();

app
  .use('/build', express.static(path.join(__dirname, 'build')))
  .get('/', sendIndex)
  .listen(PORT);

var server = http.createServer(app);
var wss = new WSServer({ server: server });

wss.on('connection', onSocketConnection);

game.start();

function sendIndex(req, res, next) {
  res.sendFile(path.join(__dirname, 'index.html'));
}

function onSocketConnection(ws) {
  console.log('client connected');

  ws.on('close', function() {
    console.log('client disconnected');
  });
}
