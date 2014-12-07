var UP = Math.PI * 0.5;

module.exports = {
  name: 'flying',
  props: {
    angle: 0,
    thrust: -10,
    reverseThrust: 5,
    turnSpeed: Math.PI * 2
  },
  update: function(seconds) {
    if (this.leftActive) this.angle -= seconds * this.turnSpeed;
    if (this.rightActive) this.angle += seconds * this.turnSpeed;

    var impulse = 0;
    if (this.forwardActive) impulse = this.thrust * seconds;
    else if (this.reverseActive) impulse = this.reverseThrust * seconds;

    var dx = Math.cos(this.angle + UP) * impulse;
    var dy = Math.sin(this.angle + UP) * impulse;
    this.shiftBy(dx, dy);
  }
};
