module.exports = {
  name: 'wandering',
  props: {
    goalX: 0,
    goalY: 0
  },
  update: function(seconds) {
    var x = this.x[0];
    var y = this.y[0];

    var dx = this.goalX - x;
    var dy = this.goalY - y;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      this.goalX = x + Math.random() * 300 - 150;
      this.goalY = y + Math.random() * 300 - 150;
      return;
    }

    var distance = Math.sqrt(dx * dx + dy * dy);
    var ratio = 1 / distance;

    this.dirX = dx * ratio;
    this.dirY = dy * ratio;
  }
};
