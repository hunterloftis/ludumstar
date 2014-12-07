var UP = Math.PI * 0.5;

module.exports = {
  name: 'shooting',
  state: {
    lastShot: Infinity,
    reloadTime: 0.1,
    launchSpeed: 2000
  },
  update: function(entity, seconds, channel) {
    if (entity.fireActive && entity.lastShot > entity.reloadTime) {
      entity.lastShot = 0;

      var vx = (entity.x[0] - entity.x[1]) / entity.interval[0];
      var vy = (entity.y[0] - entity.y[1]) / entity.interval[0];
      var launchVx = Math.cos(entity.angle - UP) * entity.launchSpeed;
      var launchVy = Math.sin(entity.angle - UP) * entity.launchSpeed;

      channel.pub('shooting/fire', {
        x: entity.x[0],
        y: entity.y[0],
        vx: vx + launchVx,
        vy: vy + launchVy
      });
    }
    else {
      entity.lastShot += seconds;
    }
  }
};
