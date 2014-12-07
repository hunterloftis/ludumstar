module.exports = {
  name: 'joystick',
  props: {
    x: 0,
    y: 0,
    radius: 0
  },
  update: function(seconds, joystick) {
    this.x = joystick.x;
    this.y = joystick.y;
    this.radius = joystick.radius;
  }
};
