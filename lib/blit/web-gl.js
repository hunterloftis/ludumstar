var VERTEX_SHADER = [
  'attribute vec2 a_position;',
  'attribute vec2 a_texture;',
  'varying vec2 v_texture;',
  'uniform vec2 u_resolution;',
  'uniform mat3 u_matrix;',

  'void main() {',

  // apply the transformation matrix
  'vec2 position = (u_matrix * vec3(a_position, 1)).xy;',

  // convert the rectangle from pixels to 0.0 to 1.0
  'vec2 zeroToOne = position / u_resolution;',

  // convert from 0->1 to 0->2
  'vec2 zeroToTwo = zeroToOne * 2.0;',

  // convert from 0->2 to -1->+1 (clipspace)
  'vec2 clipSpace = zeroToTwo - 1.0;',

  // invert y axis and assign position
  'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);',

  // pass the texture coordinate to the fragment shader
  'v_texture = a_texture;',
  '}'
].join('\n');

var FRAGMENT_SHADER = [
  'precision mediump float;',
  'uniform sampler2D u_image;',   // the texture
  'varying vec2 v_texture;',      // the texture coords passed in from the vertex shader

  'void main(void) {',
  'gl_FragColor = texture2D(u_image, v_texture);',
  '}'
].join('\n');

module.exports = {
  initGL: initGL,
  getGLContext: getGLContext,
  nextPowerOfTwo: nextPowerOfTwo
};

function initGL(gl, width, height) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Load and compile fragment shader
  var fShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fShader, FRAGMENT_SHADER);
  gl.compileShader(fShader);
  var compiled = gl.getShaderParameter(fShader, gl.COMPILE_STATUS);
  if (!compiled) {
    throw new Error('fragment shader error: ' + gl.getShaderInfoLog(fShader));
  }

  // Load and compile vertex shader
  var vShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vShader, VERTEX_SHADER);
  gl.compileShader(vShader);
  var compiled = gl.getShaderParameter(vShader, gl.COMPILE_STATUS);
  if (!compiled) {
    throw new Error('vertex shader error: ' + gl.getShaderInfoLog(vShader));
  }

  // Create the shader program
  var program = gl.createProgram();
  gl.attachShader(program, fShader);
  gl.attachShader(program, vShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Link vertex position attribute from shader
  var vertexPosition = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(vertexPosition);

  // Link texture coordinate attribute from shader
  var vertexTexture = gl.getAttribLocation(program, "a_texture");
  gl.enableVertexAttribArray(vertexTexture);

  // Provide the resolution location
  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  // Provide the transformation matrix
  var transformationMatrix = gl.getUniformLocation(program, 'u_matrix');

  return {
    position: vertexPosition,
    texture: vertexTexture,
    resolution: resolutionLocation,
    matrix: transformationMatrix
  };
}

function getGLContext(canvas, opts) {
  return canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
}

function nextPowerOfTwo(n) {
  var i = Math.floor(n / 2);
  while (i < n) i *= 2;
  return i;
}
