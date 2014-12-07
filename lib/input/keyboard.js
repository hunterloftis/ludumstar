module.exports = Keyboard;

function Keyboard() {
  this.state = { left: false, right: false, forward: false, fire: false, reverse: false };
  this.keys = { 37: 'left', 38: 'forward', 39: 'right', 32: 'fire', 40: 'reverse' };

  document.addEventListener('keydown', this.onKey.bind(this, true));
  document.addEventListener('keyup', this.onKey.bind(this, false));
}

Keyboard.prototype.onKey = function(down, e) {
  var mapped = this.keys[e.keyCode];
  if (mapped) this.state[mapped] = down;
};

Keyboard.prototype.getState = function() {
  return this.state;
};
