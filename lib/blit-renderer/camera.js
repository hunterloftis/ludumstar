var UP = Math.PI * -0.5;

module.exports = Camera;

function Camera(container) {
  this.x = 0;
  this.y = 0;

  this.angleLead = 400;
  this.baseZoom = 0.4;
  this.trail = 0.3;
  this.lift = 0;
  this.zoomOut = 0.001;
  this.drag = 0.1;
  this.lead = 0.7;
  this.offsetX = 0;
  this.offsetY = 0;

  this.zoom = 1;
  this.targetX = 0;
  this.targetY = 0;
  this.lastTargetX = 0;
  this.lastTargetY = 0;
}

Camera.prototype.leadTargetAngle = function(seconds, target) {
  var px = target.x[0];
  var py = target.y[0];
  var vx = (px - target.x[1]) / target.interval[0];
  var vy = (py - target.y[1]) / target.interval[0];
  var speed = Math.sqrt(vx * vx + vy * vy);

  var projectedX = px + Math.cos(target.angle + UP) * this.angleLead;
  var projectedY = py + Math.sin(target.angle + UP) * this.angleLead;
  var dx = projectedX - this.targetX;
  var dy = projectedY - this.targetY - this.lift;
  var wantedZoom = this.baseZoom / (speed * this.zoomOut + 1);
  var dZoom = wantedZoom - this.zoom;
  var correction = Math.min(seconds / this.trail, 1);

  this.zoom += dZoom * correction;
  this.targetX += dx * correction;
  this.targetY += dy * correction;
};

Camera.prototype.update = function(seconds, target) {
  this.leadTargetAngle(seconds, target);

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
