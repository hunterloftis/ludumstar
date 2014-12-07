var EventEmitter = require('eventemitter2').EventEmitter2;

module.exports = Network;

function Network() {
  EventEmitter.call(this);

  var host = location.origin.replace(/^http/, 'ws')

  this.isPending = false;
  this.ws = new WebSocket(host);
  this.ws.onmessage = this.onMessage.bind(this);
}

Network.prototype = Object.create(EventEmitter.prototype);

Network.prototype.onMessage = function(event) {
  this.isPending = false;
  var payload = JSON.parse(event.data);
  if (payload.type === 'state') {
    this.emit('state', payload.state);
  }
};

Network.prototype.sendState = function(state) {
  if (this.ws.readyState !== 1) return;
  if (this.isPending) return;
  this.isPending = true;
  var payload = {
    type: 'state',
    state: state
  };
  var message = JSON.stringify(payload);
  this.ws.send(message);
};
