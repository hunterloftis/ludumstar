var Blit = require('../blit');
var _ = require('lodash');

var Camera = require('./camera');
var BlitStars = require('./stars');

module.exports = Renderer;

function Renderer(container) {
  this.resize = _.debounce(this.resize.bind(this), 1000, { leading: true });

  this.camera = new Camera();
  this.surface = new Blit.Surface(container);

  this.stars = new BlitStars(this.surface);
  this.redSprite =
  this.blueSprite =
  this.missileSprite =

  this.shipSprites = {
    red: new Blit.Sprite(this.surface, 128, 128),
    blue: new Blit.Sprite(this.surface, 128, 128)
  };

  this.missileSprites = {
    red: new Blit.Sprite(this.surface, 16, 16),
    blue: new Blit.Sprite(this.surface, 16, 16)
  };

  this.shipSprites.red.canvasFrame(0, function drawShip(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillRect(width * 0.33, 0, width * 0.33, width * 0.5);
    ctx.fillRect(0, height * 0.5, width * 0.33, height * 0.5);
    ctx.fillRect(width * 0.66, height * 0.5, width * 0.33, height * 0.5);
    ctx.fillStyle = 'rgba(255, 128, 0, 1)';
    ctx.fillRect(width * 0.33, height * 0.5, width * 0.33, height * 0.5);
  });

  this.shipSprites.blue.canvasFrame(0, function drawShip(ctx, width, height) {
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillRect(width * 0.33, 0, width * 0.33, width * 0.5);
    ctx.fillRect(0, height * 0.5, width * 0.33, height * 0.5);
    ctx.fillRect(width * 0.66, height * 0.5, width * 0.33, height * 0.5);
    ctx.fillStyle = 'rgba(0, 128, 255, 1)';
    ctx.fillRect(width * 0.33, height * 0.5, width * 0.33, height * 0.5);
  });

  this.missileSprites.red.canvasFrame(0, function drawMissile(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 128, 0, 1)';
    ctx.fillRect(0, 0, width, height);
  });

  this.missileSprites.blue.canvasFrame(0, function drawMissile(ctx, width, height) {
    ctx.fillStyle = 'rgba(0, 128, 255, 1)';
    ctx.fillRect(0, 0, width, height);
  });

  this.resize();
  window.addEventListener('resize', this.resize);
}

function drawEllipse(ctx, x, y, w, h) {
  var kappa = .5522848,
  ox = (w / 2) * kappa, // control point offset horizontal
  oy = (h / 2) * kappa, // control point offset vertical
  xe = x + w,           // x-end
  ye = y + h,           // y-end
  xm = x + w / 2,       // x-middle
  ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
}

Renderer.prototype.resize = function() {
  var dims = this.surface.resize();
  this.scale = 1080 / Math.max(dims.width, dims.height);
};

Renderer.prototype.render = function(seconds, entities, playerId) {
  if (!playerId) return;

  var surface = this.surface;
  var camera = this.camera;
  var ships = findAll('ship');
  var missiles = findAll('missile');
  var player = _.find(entities, { id: playerId });
  var shipSprites = this.shipSprites;
  var missileSprites = this.missileSprites;
  var redPoints = _.find(entities, { id: 'redTeam' }).points;
  var bluePoints = _.find(entities, { id: 'blueTeam' }).points;

  if (!player) return;  // Maybe player state hasn't been sent yet

  // Track player with camera
  camera.update(seconds, player);

  // Clear the surface
  surface.clear();

  // Zoom and translate for resolution
  surface.push();
  surface.translate(surface.width * 0.5, surface.height * 0.5);             // center
  surface.scale(1 / this.scale, 1 / this.scale);                                            // scale to 1080p

  // Zoom and translate for camera
  surface.scale(camera.zoom, camera.zoom);                                          // scale to camera zoom
  surface.translate(-camera.x, -camera.y);                        // align over camera position

  // Draw the stars
  this.stars.render(seconds, surface.getRect());

  // Draw the missiles
  missiles.forEach(drawMissile);

  // Draw the ships
  ships.forEach(drawShip);

  // Unzoom and untranslate resolution
  surface.pop();

  // Render points
  drawPoints(32, 10, 32, shipSprites.red, redPoints);
  drawPoints(surface.width - 32, 10, -32, shipSprites.blue, bluePoints);

  function drawPoints(x, y, shift, sprite, points) {
    if (points <= 0) return;
    surface.push();
    surface.translate(x, y);
    surface.scale(0.2, 0.2);
    sprite.blit(-sprite.width * 0.5, 0, 0);
    surface.pop();
    drawPoints(x + shift, y, shift, sprite, points - 1);
  }

  function drawShip(state) {
    if (state.health <= 0) return;
    var sprite = shipSprites[state.team];
    if (!sprite) return;
    surface.push();
    surface.translate(state.x[0], state.y[0]);
    surface.rotate(state.angle);
    sprite.blit(sprite.width * -0.5, sprite.height * -0.5, 0);
    surface.pop();
  }

  function drawMissile(state) {
    var sprite = missileSprites[state.team];
    if (!sprite) return;
    surface.push();
    surface.translate(state.x[0], state.y[0]);
    sprite.blit(sprite.width * -0.5, sprite.height * -0.5, 0);
    surface.pop();
  }

  function findAll(name) {
    return _.filter(entities, function hasSystem(entity) {
      return entity && entity.systems.indexOf(name) !== -1;
    });
  }
};
