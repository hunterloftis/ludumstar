module.exports = {
  name: 'explosive',
  state: {
    explosivePower: 25,
    fuse: 3
  },
  update: function(entity, seconds, entities, channel) {
    var systems = this;
    entity.fuse -= seconds;
    if (entity.fuse < 0) {
      channel.trigger('explosive/die', entity.id);
    }
    entities.forEach(checkCollision);

    function checkCollision(destroyable) {
      if (destroyable.systems.indexOf('destroyable') === -1) return;
      if (destroyable.team === entity.team) return;

      var r2 = destroyable.radius * destroyable.radius;
      var dx = entity.x[0] - destroyable.x[0];
      var dy = entity.y[0] - destroyable.y[0];
      var d2 = dx * dx + dy * dy;
      if (d2 <= r2) {
        channel.trigger('explosive/hit', destroyable.id, entity.id);
        channel.trigger('explosive/die', entity.id);
        systems.takeDamage(destroyable, entity.explosivePower);
      }
    }
  }
};
