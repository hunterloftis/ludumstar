module.exports = {
  name: 'explosive',
  props: {
    explosivePower: 10,
    fuse: 5
  },
  update: function(seconds, channel) {
    this.fuse -= seconds;
    if (this.fuse < 0) {
      channel.pub('explosive/die', this.id);
    }
  }
};
