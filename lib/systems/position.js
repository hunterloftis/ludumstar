module.exports = {
  name: 'position',
  state: {
    x: [0, 0, 0],
    y: [0, 0, 0],
    interval: [1, 1, 1]
  },
  shiftPosition: function(entity, dx, dy) {
    entity.x[0] += dx;
    entity.y[0] += dy;
  },
  movePosition: function(entity, x, y, seconds) {
    entity.x.unshift(x);
    entity.x.pop();

    entity.y.unshift(y);
    entity.y.pop();

    entity.interval.unshift(seconds);
    entity.interval.pop();
  },
  setPosition: function(entity, props) {
    if (!props) return;

    var x = props.x;
    var y = props.y;
    var vx = props.vx || 0;
    var vy = props.vy || 0;

    entity.x = [x, x - vx, x - vx];
    entity.y = [y, y - vy, y - vy];
    entity.interval = [1, 1, 1];
  },
  update: function(entity, seconds, range) {
    var px = entity.x[0];
    var py = entity.y[0];
    var distance = Math.sqrt(px * px + py * py);

    if (distance > range) {
      entity.x[0] *= range / distance;
      entity.y[0] *= range / distance;
    }
  }
};
