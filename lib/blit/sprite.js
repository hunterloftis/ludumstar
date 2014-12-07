var WebGL = require('./web-gl');

module.exports = Sprite;

function Sprite(surface, width, height, url) {
  this.surface = surface;
  this.textures = [];       // TODO: instead of an array, store as a large texture and select frames with UV coords
  this.width = width;
  this.height = height;
  this.image = new Image();

  // Buffers
  this.vertexBuffer = surface.gl.createBuffer();
  this.textureBuffer = surface.gl.createBuffer();

  // Texture coords
  this.textureCoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]);

  this.image.onload = this._onLoad.bind(this);
  if (url) this.loadUrl(url);
}

// TODO: allow you to render on a non-power-of-two and then convert to a power-of-two
Sprite.prototype.canvasFrame = function(frame, drawFn) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var size = WebGL.nextPowerOfTwo(Math.max(this.width, this.height));

  canvas.width = size;
  canvas.height = size;

  drawFn(ctx, canvas.width, canvas.height);

  this._createTexture(canvas, frame);
};

Sprite.prototype.getFrameCount = function() {
  return this.textures.length;
};

Sprite.prototype.loadUrl = function(url) {
  this.image.src = url;
};

Sprite.prototype._onLoad = function() {
  var gl = this.surface.gl;
  var image = this.image;

  // Create a square power-of-two canvas to resize the texture onto
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var size = WebGL.nextPowerOfTwo(Math.max(this.width, this.height));
  canvas.width = size;
  canvas.height = size;

  // Loop through each frame in the image
  for (var y = 0; y < image.height; y += this.height) {
    for (var x = 0; x < image.width; x += this.width) {
      ctx.clearRect(0, 0, size, size);
      var safeW = Math.min(this.width, image.width - x);    // Safari won't copy over the edge
      var safeH = Math.min(this.height, image.height - y);
      ctx.drawImage(image, x, y, safeW, safeH, 0, 0, size, size);
      this._createTexture(canvas);
    }
  }
};

Sprite.prototype._createTexture = function(canvas, index) {
  var gl = this.surface.gl;
  var texture = gl.createTexture();

  index = index || this.textures.length;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

  // Setup scaling properties (only works with power-of-2 textures)
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // gl.generateMipmap(gl.TEXTURE_2D);

  // Makes non-power-of-2 textures ok:
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

  // Unbind the texture
  gl.bindTexture(gl.TEXTURE_2D, null);

  // Store the texture
  this.textures[index] = texture;
};

Sprite.prototype.blit = function(x, y, frame) {
  frame = frame || 0;

  if (!this.textures[frame]) return;

  var surface = this.surface;
  var gl = surface.gl;
  var vertexPosition = surface.locations.position;
  var vertexTexture = surface.locations.texture;
  var matrixLocation = surface.locations.matrix;
  var matrix = surface.getMatrix();

  // Bind the vertex buffer as the current buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

  // Fill it with the vertex data
  var x1 = x;
  var x2 = x + this.width;
  var y1 = y;
  var y2 = y + this.height;
  var vertices = new Float32Array([
    x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Connect vertex buffer to shader's vertex position attribute
  gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

  // Bind the shader buffer as the current buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);

  // Fill it with the texture data
  gl.bufferData(gl.ARRAY_BUFFER, this.textureCoords, gl.STATIC_DRAW);

  // Connect texture buffer to shader's texture attribute
  gl.vertexAttribPointer(vertexTexture, 2, gl.FLOAT, false, 0, 0);

  // Set slot 0 as active texture
  gl.activeTexture(gl.TEXTURE0); // TODO: necessary?
  //gl.activeTexture(gl['TEXTURE' + frame]);

  // Load texture into memory
  gl.bindTexture(gl.TEXTURE_2D, this.textures[frame]);

  // Apply the transformation matrix
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Draw triangles that make up a rectangle
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Unbind everything
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
};
