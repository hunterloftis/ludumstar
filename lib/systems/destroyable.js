module.exports = {
  name: 'destroyable',
  state: {
    health: 100,
    radius: 60
  },
  takeDamage: function(entity, amount) {
    entity.health -= amount;
  },
  update: function(entity, seconds, channel) {
    if (entity.health <= 0) {
      channel.trigger('destroyable/die', entity.id);
    }
  }
};
