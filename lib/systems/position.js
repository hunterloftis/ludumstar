module.exports = {
  name: 'position',
  props: {
    x: [0, 0, 0],
    y: [0, 0, 0],
    interval: [1, 1, 1],
    shiftBy: function(dx, dy) {
      this.x[0] += dx;
      this.y[0] += dy;
    },
    moveTo: function(x, y, seconds) {
      this.x.unshift(x);
      this.x.pop();

      this.y.unshift(y);
      this.y.pop();

      this.interval.unshift(seconds);
      this.interval.pop();
    }
  },
  setState: function(props) {
    if (!props) return;

    var x = props.x;
    var y = props.y;
    var vx = props.vx || 0;
    var vy = props.vy || 0;

    return {
      x: [x, x - vx, x - vx],
      y: [y, y - vy, y - vy],
      interval: [1, 1, 1]
    };
  },
  getState: function() {
    var vx0 = (this.x[0] - this.x[1]) / this.interval[0];
    var vx1 = (this.x[1] - this.x[2]) / this.interval[1];

    var vy0 = (this.y[0] - this.y[1]) / this.interval[0];
    var vy1 = (this.y[1] - this.y[2]) / this.interval[1];

    return {
      px: this.x[0],
      py: this.y[0],
      vx: vx0,
      vy: vy0,
      ax: vx0 - vx1,
      ay: vy0 - vy1,
      speed: Math.sqrt(vx0 * vx0 + vy0 * vy0)
    };
  }
};
