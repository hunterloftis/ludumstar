module.exports = {
  name: 'controllable',
  state: {
    leftActive: false,
    rightActive: false,
    forwardActive: false,
    reverseActive: false,
    fireActive: false
  },
  update: function(entity, seconds, keyboard, playerId) {
    if (!playerId) return;
    if (entity.id !== playerId) return;

    entity.leftActive = keyboard.left;
    entity.rightActive = keyboard.right;
    entity.forwardActive = keyboard.forward;
    entity.reverseActive = keyboard.reverse;
    entity.fireActive = keyboard.fire;
  }
};
