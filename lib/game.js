var Loop = require('./loop/loop');
var EntityGroup = require('./esystem').EntityGroup;
var Preach = require('preach');

var SYSTEMS = [
  require('./systems/position'),
  require('./systems/controllable'),
  require('./systems/ship'),
  require('./systems/verlet'),
  require('./systems/flying'),
  require('./systems/destroyable'),
  require('./systems/shooting'),
  require('./systems/explosive'),
  require('./systems/missile')
];

module.exports = Game;

var noRenderer = {
  render: function() {}
};

var noKeyboard = {
  getState: function() { return {}; }
};

function Game(renderer, keyboard) {
  this.renderer = renderer || noRenderer;
  this.keyboard = keyboard || noKeyboard;
  this.loop = new Loop(180);
  this.channel = new Preach();

  this.entities = new EntityGroup(SYSTEMS);

  this.entities.create('player')
    .add('position')
    .add('controllable')
    .add('ship')
    .add('verlet')
    .add('flying')
    .add('destroyable')
    .add('shooting');

  this.entities.create()
    .add('position')
    .add('ship')
    .add('verlet')
    .add('flying')
    .add('destroyable')
    .add('shooting');
}

Game.prototype.start = function() {
  var entities = this.entities;
  var keyboard = this.keyboard;
  var renderer = this.renderer;

  this.channel.sub('shooting/fire', this.createMissile.bind(this));
  this.channel.sub('explosive/die', this.destroyEntity.bind(this));

  this.loop.start(simulate.bind(this), render.bind(this));

  function simulate(seconds) {
    entities.update('verlet', seconds);
    entities.update('controllable', seconds, keyboard.getState());
    entities.update('flying', seconds);
    entities.update('shooting', seconds, this.channel);
    entities.update('explosive', seconds, this.channel);
    entities.update('destroyable', seconds);
  }

  function render(seconds) {
    renderer.render(seconds, entities.getState(), 'player');
  }
};

Game.prototype.createMissile = function(position) {
  var missile = this.entities.create()
    .add('position', position)
    .add('missile')
    .add('verlet')
    .add('explosive');
};

Game.prototype.destroyEntity = function(id) {
  this.entities.destroy(id);
};
