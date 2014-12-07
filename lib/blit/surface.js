var mat3 = require('gl-matrix-mat3');
var vec2 = require('gl-matrix-vec2');

var WebGL = require('./web-gl');

module.exports = Surface;

function Surface(canvas) {
  this.canvas = canvas;
  this.matrixStack = [ mat3.create() ];
  this.width = 0;
  this.height = 0;

  this.gl = WebGL.getGLContext(canvas, { alpha: false, premultipliedAlpha: false });
  this.locations = WebGL.initGL(this.gl, this.width, this.height);
  this.resize();
}

Surface.prototype.resize = function() {
  var density = window.devicePixelRatio || 1;
  var width = this.canvas.clientWidth * density;
  var height = this.canvas.clientHeight * density;

  this.width = this.canvas.width = width;
  this.height = this.canvas.height = height;
  this.density = density;

  this.gl.viewport(0, 0, width, height);
  this.gl.uniform2f(this.locations.resolution, width, height);

  return {
    width: width,
    height: height
  };
};

Surface.prototype.clear = function(color) {
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
};

Surface.prototype.push = function() {
  this.matrixStack.push( mat3.clone(this.getMatrix()) );
};

Surface.prototype.pop = function() {
  return this.matrixStack.pop();
};

Surface.prototype.getMatrix = function() {
  return this.matrixStack[this.matrixStack.length - 1];
};

Surface.prototype.translate = function(tx, ty) {
  var m = this.getMatrix();
  var v = vec2.set(vec2.create(), tx, ty);
  mat3.translate(m, m, v);
};

Surface.prototype.scale = function(scaleX, scaleY) {
  var m = this.getMatrix();
  var v = vec2.set(vec2.create(), scaleX, scaleY);
  mat3.scale(m, m, v);
};

Surface.prototype.rotate = function(rad) {
  var m = this.getMatrix();
  mat3.rotate(m, m, rad);
};

Surface.prototype.getRect = function() {
  var m = mat3.clone(this.getMatrix());
  var ul = vec2.set(vec2.create(), 0, 0);
  var lr = vec2.set(vec2.create(), this.width, this.height);
  mat3.invert(m, m);
  vec2.transformMat3(ul, ul, m);
  vec2.transformMat3(lr, lr, m);
  return {
    left: ul[0],
    top: ul[1],
    right: lr[0],
    bottom: lr[1]
  };
};
