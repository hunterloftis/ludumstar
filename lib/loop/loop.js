module.exports = Loop;

function Loop(requestAnimationFrame, fps) {
  this.raf = requestAnimationFrame;
  this.fps = fps;
  this.simTicks = 1000 / fps;
}

Loop.prototype.start = function(simulateFn, renderFn) {
  var timeBuffer = 0;
  var lastTime = 0;
  var simTicks = this.simTicks;
  var simSeconds = simTicks / 1000;
  var requestAnimationFrame = this.raf;

  var perfNow = window.performance && window.performance.now
    ? window.performance.now.bind(window.performance)
    : Date.now.bind(Date);

  requestAnimationFrame(frame);

  function frame() {
    var now = perfNow();
    var ticks = now - lastTime;

    if (ticks > 100) ticks = 0;
    timeBuffer += ticks;

    if (timeBuffer >= simTicks) {
      while (timeBuffer >= simTicks) {
        simulateFn(simSeconds);
        timeBuffer -= simTicks;
      }
      renderFn(ticks / 1000);
    }

    lastTime = now;
    requestAnimationFrame(frame);
  }
};
