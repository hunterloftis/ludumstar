var Blit = require('../blit');

module.exports = Joystick;

function Joystick(surface) {
  this.surface = surface;
  this.radius = 0;
  this.sprite = undefined;
}

Joystick.prototype.render = function(seconds, joystick) {
  var density = this.surface.density;
  var radius = joystick.radius * density;
  var x = joystick.x * density;
  var y = joystick.y * density;

  if (radius !== this.radius) {
    this.sprite = undefined;
    this.radius = radius;
  }
  if (!this.sprite) {
    this.sprite = this.generateSprite(this.radius);
  }
  this.sprite.blit(x - this.sprite.width * 0.5, y - this.sprite.height * 0.5);
};

Joystick.prototype.generateSprite = function(radius) {
  var size = radius * 2;
  var sprite = new Blit.Sprite(this.surface, size, size);
  sprite.canvasFrame(0, function drawCircle(ctx, width, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.arc(width * 0.5, height * 0.5, width * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  return sprite;
}
