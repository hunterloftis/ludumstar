module.exports = {
  name: 'walking',
  props: {
    power: 13,
    maxSpeed: 220,
    slowDown: 0.96,
    distance: 0
  },
  update: function(seconds) {
    var dirX = this.dirX || 0;
    var dirY = this.dirY || 0;

    var impulseX = this.power * dirX;
    var impulseY = this.power * dirY;

    var vx = (this.x[0] - this.x[1]) / this.interval[0];
    var vy = (this.y[0] - this.y[1]) / this.interval[0];

    var dx = vx * this.slowDown + impulseX;
    var dy = vy * this.slowDown + impulseY;
    var speed = Math.sqrt(dx * dx + dy * dy);

    if (speed > this.maxSpeed) {
      dx *= this.maxSpeed / speed;
      dy *= this.maxSpeed / speed;
    }

    var newX = this.x[0] + dx * seconds;
    var newY = this.y[0] + dy * seconds;

    this.distance += speed * seconds;
    this.moveTo(newX, newY, seconds);
  }
};
