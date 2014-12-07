var path = require('path');
var express = require('express');
var http = require('http');
var WSServer = require('ws').Server;
var present = require('present');

var Game = require('./lib/game');
var transport = require('./lib/network/transport');

var PORT = process.env.PORT || 5000;
var DROP_DELAY = 5000;

var networkRenderer = {
  clients: [],
  createClient: function(ws) {
    var client = {
      id: undefined,
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
  updateFromClient: function(client, data) {
    client.isPending = false;
    client.lastAnswered = present();
    var payload = transport.unpack(data);
    if (payload.type === 'playerState') {
      if (payload.state) {
        game.entities.set(client.id, payload.state);
      }
      else {
        // Has the client's player been destroyed?
        if (client.id && !game.entities.get(client.id)) client.id = undefined;
        if (!client.id) {
          // give the client a player!
          client.id = game.createPlayer();

          // Don't check readyState because this has to go through
          transport.send(client.ws, transport.pack({
            type: 'id',
            id: client.id
          }));
        }
      }
    }
  },
  render: function(seconds, state) {
    var now = present();
    var message = transport.pack({
      type: 'state',
      state: state
    });

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
      transport.send(client.ws, message);
      client.isPending = true;
    }
  }
};

var game = new Game(undefined, undefined);
var app = express();
var server = http.createServer(app);
var wss = new WSServer({ server: server });

app
  .use('/build', express.static(path.join(__dirname, 'build')))
  .use('/vendor', express.static(path.join(__dirname, 'vendor')))
  .get('/', sendIndex);

wss.on('connection', onSocketConnection);
game.on('render', networkRenderer.render.bind(networkRenderer));

game.start();
server.listen(PORT);
console.log('Listening on', PORT);



function sendIndex(req, res, next) {
  res.sendFile(path.join(__dirname, 'index.html'));
}

function onSocketConnection(ws) {
  console.log('client connected');

  var client = networkRenderer.createClient(ws);

  ws.on('message', function(data, flags) {
    networkRenderer.updateFromClient(client, data);
  });

  ws.on('close', function() {
    game.destroyEntity(client.id);
    networkRenderer.destroyClient(client);
    console.log('client disconnected');
  });
}
