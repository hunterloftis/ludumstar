var Blit = require('../blit');
var _ = require('lodash');

var Camera = require('./camera');

module.exports = Renderer;

function Renderer(container) {
  this.resize = _.debounce(this.resize.bind(this), 1000, { leading: true });

  this.camera = new Camera();
  this.surface = new Blit.Surface(container);

  this.shipSprite = new Blit.Sprite(this.surface, 128, 128);
  this.fireSprite = new Blit.Sprite(this.surface, 8, 8);

  this.shipSprite.canvasFrame(0, function drawShip(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(width * 0.33, 0, width * 0.33, width * 0.5);
    ctx.fillRect(0, height * 0.5, width * 0.33, height * 0.5);
    ctx.fillRect(width * 0.66, height * 0.5, width * 0.33, height * 0.5);
  });

  this.fireSprite.canvasFrame(0, function drawParticle(ctx, width, height) {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    drawEllipse(ctx, 0, 0, width, height);
    ctx.fill();
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
  var surface = this.surface;
  var camera = this.camera;
  var ships = findAll('ship');
  var player = _.find(entities, { id: playerId });
  var shipSprite = this.shipSprite;

  // Track player with camera
  camera.update(seconds, player);

  // Clear the surface
  surface.clear();

  // Zoom and translate
  surface.push();
  surface.translate(surface.width * 0.5, surface.height * 0.5);             // center
  surface.scale(1 / this.scale, 1 / this.scale);                                            // scale to 1080p
  //surface.translate(-player.px, -player.py);
  surface.scale(camera.zoom, camera.zoom);                                          // scale to camera zoom
  surface.translate(-camera.x, -camera.y);                        // align over camera position



  // Draw the characters
  ships.forEach(drawShip);

  // Unzoom and untranslate
  surface.pop();

  function drawShip(state) {
    surface.push();
    surface.translate(state.px, state.py);
    surface.rotate(state.angle);
    shipSprite.blit(shipSprite.width * -0.5, shipSprite.height * -0.5, 0);
    surface.pop();
  }

  function findAll(name) {
    return _.filter(entities, function hasSystem(entity) {
      return entity.systems.indexOf(name) !== -1;
    });
  }
};
