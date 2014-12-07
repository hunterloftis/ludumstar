var UP = Math.PI * 0.5;

module.exports = {
  name: 'shooting',
  props: {
    lastShot: Infinity,
    reloadTime: 0.1,
    launchSpeed: 2000
  },
  update: function(seconds, channel) {
    if (this.fireActive && this.lastShot > this.reloadTime) {
      this.lastShot = 0;

      var vx = (this.x[0] - this.x[1]) / this.interval[0];
      var vy = (this.y[0] - this.y[1]) / this.interval[0];
      var launchVx = Math.cos(this.angle - UP) * this.launchSpeed;
      var launchVy = Math.sin(this.angle - UP) * this.launchSpeed;

      channel.pub('shooting/fire', {
        x: this.x[0],
        y: this.y[0],
        vx: vx + launchVx,
        vy: vy + launchVy
      });
    }
    else {
      this.lastShot += seconds;
    }
  }
};
