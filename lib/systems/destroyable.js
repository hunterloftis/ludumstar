module.exports = {
  name: 'destroyable',
  state: {
    health: 100,
    radius: 60,
    lastAttackerId: undefined
  },
  takeDamage: function(entity, amount, attackerId) {
    entity.health -= amount;
    entity.lastAttacker = attackerId;
  },
  update: function(entity, seconds, channel) {
    if (entity.health <= 0) {
      channel.trigger('destroyable/die', entity);
    }
  }
};
