var UP = Math.PI * 0.5;

module.exports = {
  name: 'shooting',
  state: {
    lastShot: Infinity,
    reloadTime: 0.1,
    launchSpeed: 3000,
    ammo: 100
  },
  update: function(entity, seconds, channel) {
    if (entity.fireActive && entity.lastShot > entity.reloadTime) {
      if (entity.ammo <= 0) return;

      entity.lastShot = 0;
      entity.ammo--;

      var width = 32;
      var vx = (entity.x[0] - entity.x[1]) / entity.interval[0];
      var vy = (entity.y[0] - entity.y[1]) / entity.interval[0];
      var launchVx = Math.cos(entity.angle - UP) * entity.launchSpeed;
      var launchVy = Math.sin(entity.angle - UP) * entity.launchSpeed;
      var shotOffset = entity.ammo % 2 === 0 ? width : -width;
      var offX = Math.cos(entity.angle) * shotOffset;
      var offY = Math.sin(entity.angle) * shotOffset;

      channel.trigger('shooting/fire', entity.team, {
        x: entity.x[0] + offX,
        y: entity.y[0] + offY,
        vx: vx + launchVx,
        vy: vy + launchVy,
      });
    }
    else {
      entity.lastShot += seconds;
    }
  }
};
