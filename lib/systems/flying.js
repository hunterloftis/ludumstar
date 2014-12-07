var UP = Math.PI * 0.5;

module.exports = {
  name: 'flying',
  state: {
    angle: 0,
    thrust: -10,
    reverseThrust: 5,
    turnSpeed: Math.PI * 2
  },
  update: function(entity, seconds, playerId) {
    if (entity.leftActive) entity.angle -= seconds * entity.turnSpeed;
    if (entity.rightActive) entity.angle += seconds * entity.turnSpeed;

    var impulse = 0;
    if (entity.forwardActive) impulse = entity.thrust * seconds;
    else if (entity.reverseActive) impulse = entity.reverseThrust * seconds;

    var dx = Math.cos(entity.angle + UP) * impulse;
    var dy = Math.sin(entity.angle + UP) * impulse;

    this.shiftPosition(entity, dx, dy);
  }
};
