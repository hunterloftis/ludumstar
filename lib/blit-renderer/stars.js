var Blit = require('../blit');
var NoiseJS = require('noisejs');

module.exports = Stars;

function Stars(surface) {
  this.surface = surface;
  this.noise = new NoiseJS.Noise(Math.random());
  this.sprite = new Blit.Sprite(this.surface, 32, 32);
  this.gridSize = 128;

  this.sprite.canvasFrame(0, function(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(width * 0.33, 0, width * 0.33, height);
    ctx.fillRect(0, height * 0.33, width, height * 0.33);
  });
}

Stars.prototype.render = function(seconds, rect) {
  var size = this.gridSize;
  var frameCount = this.sprite.getFrameCount();
  var scale = 10;

  var ox = Math.floor(rect.left / size) * size;
  var oy = Math.floor(rect.top / size) * size;

  for (var y = oy; y < rect.bottom; y += size) {
    for (var x = ox; x < rect.right; x += size) {
      var u = Math.abs(x);
      var v = Math.abs(y);
      var rand = (this.noise.simplex2(u / scale, v / scale) + 1) / 2;
      if (rand > 0.9) this.sprite.blit(x, y, 0);
    }
  }
};
