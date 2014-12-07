module.exports = {
  name: 'explosive',
  state: {
    explosivePower: 10,
    fuse: 5
  },
  update: function(entity, seconds, channel) {
    entity.fuse -= seconds;
    if (entity.fuse < 0) {
      channel.pub('explosive/die', entity.id);
    }
  }
};
