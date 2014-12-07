var Blit = require('../blit');
var NoiseJS = require('noisejs');

module.exports = Terrain;

function Terrain(surface) {
  this.surface = surface;
  this.noise = new NoiseJS.Noise(Math.random());
  this.sprite = new Blit.Sprite(this.surface, 128, 128, 'images/colorful_leaves_tiles.jpg');
}

Terrain.prototype.render = function(seconds, map, rect) {
  var width = this.sprite.width;
  var height = this.sprite.height;
  var frameCount = this.sprite.getFrameCount();
  var scale = 1;

  var ox = Math.floor(rect.left / width) * width;
  var oy = Math.floor(rect.top / height) * height;

  for (var y = oy; y < rect.bottom; y += width) {
    for (var x = ox; x < rect.right; x += height) {
      var u = Math.abs(x);
      var v = Math.abs(y);
      var rand = (this.noise.simplex2(u / scale, v / scale) + 1) / 2;
      var frame = Math.floor(rand * frameCount);
      this.sprite.blit(x, y, frame);
    }
  }
};
