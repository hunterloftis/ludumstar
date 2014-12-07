module.exports = {
  name: 'verlet',
  props: {
    mass: 1,
    drag: 0.000001
  },
  update: function(seconds) {
    var vx = (this.x[0] - this.x[1]) / this.interval[1];
    var vy = (this.y[0] - this.y[1]) / this.interval[1];

    var speed = Math.sqrt(vx * vx + vy * vy);

    var drag = speed * speed * this.drag;
    var total = Math.max(Math.abs(vx) + Math.abs(vy), 0.0000001);
    var dragX = drag * (vx / total);
    var dragY = drag * (vy / total);

    var dx = (vx - dragX) * seconds;
    var dy = (vy - dragY) * seconds;

    var newX = this.x[0] + dx;
    var newY = this.y[0] + dy;

    //this.distance += Math.sqrt(dx * dx + dy * dy);
    this.moveTo(newX, newY, seconds);
  }
};
