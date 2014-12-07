module.exports = {
  name: 'controllable',
  props: {
    leftActive: false,
    rightActive: false,
    forwardActive: false,
    reverseActive: false,
    fireActive: false
  },
  update: function(seconds, keyboard) {
    this.leftActive = keyboard.left;
    this.rightActive = keyboard.right;
    this.forwardActive = keyboard.forward;
    this.reverseActive = keyboard.reverse;
    this.fireActive = keyboard.fire;
  }
};
