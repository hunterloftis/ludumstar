var path = require('path');
var express = require('express');
var http = require('http');
var WSServer = require('ws').Server;
var Game = require('./lib/game');
var present = require('present');

var PORT = process.env.PORT || 5000;
var DROP_DELAY = 5000;

var networkRenderer = {
  clients: [],
  createClient: function(ws) {
    var client = {
      ws: ws,
      isPending: false,
      lastAnswered: present()
    };
    this.clients.push(client);
    return client;
  },
  destroyClient: function(client) {
    var index = this.clients.indexOf(client);
    this.clients.splice(index, 1);
  },
  render: function(seconds, state, playerId) {
    var now = present();
    var payload = {
      type: 'state',
      state: state
    };
    var string = JSON.stringify(payload);

    // First, drop any clients we haven't heard from in a while
    this.clients = this.clients.filter(dropIfGone);

    // For any non-pending clients, send an update
    this.clients.forEach(sendState);

    function dropIfGone(client) {
      if (client.lastAnswered < now - DROP_DELAY) {
        console.log('Dropping client (timed out)');
        client.ws.close();
        return false;
      }
      return true;
    }

    function sendState(client) {
      if (client.isPending) return;
      client.ws.send(string);
      client.isPending = true;
    }
  }
};

var game = new Game(networkRenderer, undefined);
var app = express();
var server = http.createServer(app);
var wss = new WSServer({ server: server });

app
  .use('/build', express.static(path.join(__dirname, 'build')))
  .use('/vendor', express.static(path.join(__dirname, 'vendor')))
  .get('/', sendIndex);

wss.on('connection', onSocketConnection);

game.start();

server.listen(PORT);
console.log('Listening on', PORT);


function sendIndex(req, res, next) {
  res.sendFile(path.join(__dirname, 'index.html'));
}

function onSocketConnection(ws) {
  var client = networkRenderer.createClient(ws);
  console.log('client connected');

  ws.on('close', function() {
    networkRenderer.destroyClient(client);
    console.log('client disconnected');
  });
}
