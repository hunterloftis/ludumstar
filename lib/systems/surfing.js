module.exports = {
  name: 'surfing',
  props: {
    power: 5,
    drag: 0.00006,
    distance: 0
  },
  update: function(seconds) {
    var dirX = this.dirX || 0;
    var dirY = this.dirY || 0;

    var vx = (this.x[0] - this.x[1]) / this.interval[0];
    var vy = (this.y[0] - this.y[1]) / this.interval[0];

    var speed = Math.sqrt(vx * vx + vy * vy);

    var drag = speed * speed * this.drag;
    var total = Math.max(Math.abs(vx) + Math.abs(vy), 0.0000001);
    var dragX = drag * (vx / total);
    var dragY = drag * (vy / total);

    var impulseX = this.power * dirX - dragX;
    var impulseY = this.power * dirY - dragY;

    var dx = (vx + impulseX) * seconds;
    var dy = (vy + impulseY) * seconds;

    var newX = this.x[0] + dx;
    var newY = this.y[0] + dy;

    this.distance += Math.sqrt(dx * dx + dy * dy);
    this.moveTo(newX, newY, seconds);
  }
};
