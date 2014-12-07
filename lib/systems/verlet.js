module.exports = {
  name: 'verlet',
  state: {
    mass: 1,
    drag: 0.000001
  },
  update: function(entity, seconds) {
    var vx = (entity.x[0] - entity.x[1]) / entity.interval[0];
    var vy = (entity.y[0] - entity.y[1]) / entity.interval[0];

    var speed = Math.sqrt(vx * vx + vy * vy);

    var drag = speed * speed * entity.drag;
    var total = Math.max(Math.abs(vx) + Math.abs(vy), entity.drag);
    var dragX = drag * (vx / total);
    var dragY = drag * (vy / total);

    var dx = (vx - dragX) * seconds;
    var dy = (vy - dragY) * seconds;

    var newX = entity.x[0] + dx;
    var newY = entity.y[0] + dy;

    this.movePosition(entity, newX, newY, seconds);
  }
};
