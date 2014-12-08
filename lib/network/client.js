var EventEmitter = require('eventemitter2').EventEmitter2;
var transport = require('./transport');

module.exports = Client;

function Client() {
  EventEmitter.call(this);

  var host = location.origin.replace(/^http/, 'ws')

  this.isPending = false;
  this.ws = new ReconnectingWebSocket(host);
  this.ws.onmessage = this.onMessage.bind(this);
}

Client.prototype = Object.create(EventEmitter.prototype);

Client.prototype.onMessage = function(event) {
  this.isPending = false;
  var payload = transport.unpack(event.data);
  if (payload.type === 'state') {
    this.emit('state', payload.state);
  }
  else if (payload.type === 'id') {
    this.emit('id', payload.id);
  }
};

Client.prototype.sendPlayer = function(state) {
  if (this.isPending) return;
  this.isPending = true;
  transport.send(this.ws, transport.pack({
    type: 'playerState',
    state: state
  }));
};
