module.exports = {
  name: 'position',
  state: {
    x: [0, 0, 0],
    y: [0, 0, 0],
    interval: [1, 1, 1]
  },
  shift: function(entity, dx, dy) {
    entity.x[0] += dx;
    entity.y[0] += dy;
  },
  move: function(entity, x, y, seconds) {
    entity.x.unshift(x);
    entity.x.pop();

    entity.y.unshift(y);
    entity.y.pop();

    entity.interval.unshift(seconds);
    entity.interval.pop();
  },
  set: function(entity, props) {
    if (!props) return;

    var x = props.x;
    var y = props.y;
    var vx = props.vx || 0;
    var vy = props.vy || 0;

    entity.x = [x, x - vx, x - vx];
    entity.y = [y, y - vy, y - vy];
    entity.interval = [1, 1, 1];
  },
  getPhysics: function(entity) {
    var vx0 = (entity.x[0] - entity.x[1]) / entity.interval[0];
    var vx1 = (entity.x[1] - entity.x[2]) / entity.interval[1];

    var vy0 = (entity.y[0] - entity.y[1]) / entity.interval[0];
    var vy1 = (entity.y[1] - entity.y[2]) / entity.interval[1];

    return {
      px: entity.x[0],
      py: entity.y[0],
      vx: vx0,
      vy: vy0,
      ax: vx0 - vx1,
      ay: vy0 - vy1,
      speed: Math.sqrt(vx0 * vx0 + vy0 * vy0)
    };
  }
};
