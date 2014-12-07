module.exports = Camera;

function Camera(container) {
  this.x = 0;
  this.y = 0;

  this.baseZoom = 2;
  this.trail = 0.3;
  this.lift = 0;
  this.zoomOut = 0.002;
  this.drag = 0.1;
  this.projection = 0.67;
  this.offsetX = 0;
  this.offsetY = 0;

  this.zoom = 1;
  this.targetX = 0;
  this.targetY = 0;
  this.lastTargetX = 0;
  this.lastTargetY = 0;
}

Camera.prototype.leadTarget = function(seconds, target) {
  var projectedX = target.px + target.vx * this.projection;
  var projectedY = target.py + target.vy * this.projection;
  var dx = projectedX - this.targetX;
  var dy = projectedY - this.targetY - this.lift;
  var wantedZoom = this.baseZoom / (target.speed * this.zoomOut + 1);
  var dZoom = wantedZoom - this.zoom;
  var correction = Math.min(seconds / this.trail, 1);

  this.zoom += dZoom * correction;
  this.targetX += dx * correction;
  this.targetY += dy * correction;
};

Camera.prototype.update = function(seconds, target) {
  this.leadTarget(seconds, target);

  var efficiency = 1 - this.drag;
  var vx = (this.targetX - this.lastTargetX) * efficiency;
  var vy = (this.targetY - this.lastTargetY) * efficiency;

  this.targetX += vx * seconds;
  this.targetY += vy * seconds;
  this.lastTargetX = this.targetX;
  this.lastTargetY = this.targetY;

  this.x = this.targetX - this.offsetX;
  this.y = this.targetY - this.offsetY;
};
