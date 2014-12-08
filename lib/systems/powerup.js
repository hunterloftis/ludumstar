module.exports = {
  name: 'powerup',
  state: {
    powerupType: 'ammo',
    radius: 60,
    powerupLife: 30
  },
  update: function(entity, seconds, others, channel) {
    entity.powerupLife -= seconds;
    if (entity.powerupLife <= 0) {
      channel.trigger('powerup/die', entity.id);
      return;
    }

    others.forEach(collideWithShips);

    function collideWithShips(ship) {
      if (ship.systems.indexOf('ship') === -1) return;
      if (ship.team === entity.team) return;
      if (!ship.radius) return;

      var r2 = ship.radius * ship.radius + entity.radius * entity.radius;
      var dx = entity.x[0] - ship.x[0];
      var dy = entity.y[0] - ship.y[0];
      var d2 = dx * dx + dy * dy;

      if (d2 <= r2) {
        if (entity.powerupType === 'ammo') {
          ship.ammo += 100;
        }
        channel.trigger('powerup/die', entity.id);
      }
    }
  }
}
