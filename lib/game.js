var Loop = require('./loop/loop');
var EntityGroup = require('./entity-group');
var Preach = require('preach');
var EventEmitter = require('eventemitter2').EventEmitter2;

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
  EventEmitter.call(this);

  this.renderer = renderer || noRenderer;
  this.keyboard = keyboard || noKeyboard;
  this.loop = new Loop(180);
  this.channel = new Preach();

  this.entities = new EntityGroup(SYSTEMS);

  this.entities.create('player', [
    'position', 'controllable', 'ship', 'verlet', 'flying', 'destroyable', 'shooting'
  ]);

  this.entities.create([
    'position', 'ship', 'verlet', 'flying', 'destroyable', 'shooting'
  ]);
}

Game.prototype = Object.create(EventEmitter.prototype);

Game.prototype.start = function() {
  var entities = this.entities;
  var keyboard = this.keyboard;
  var renderer = this.renderer;

  this.channel.sub('shooting/fire', this.createMissile.bind(this));
  this.channel.sub('explosive/die', this.destroyEntity.bind(this));

  this.loop.start(simulate.bind(this), render.bind(this));

  function simulate(seconds) {
    entities.update('verlet', [ seconds ]);
    entities.update('controllable', [ seconds, keyboard.getState() ]);
    entities.update('flying', [ seconds ]);
    entities.update('shooting', [ seconds, this.channel ]);
    entities.update('explosive', [ seconds, this.channel ]);
    entities.update('destroyable', [ seconds ]);
    entities.update('position', [ seconds ]);
  }

  function render(seconds) {
    var state = entities.getState();
    renderer.render(seconds, state, 'player');
    this.emit('render', seconds, state);
  }
};

Game.prototype.createMissile = function(position) {
  var entities = this.entities;
  var entity = entities.create([ 'position', 'missile', 'verlet', 'explosive' ]);
  entities.systems.setPosition(entity, position);
};

Game.prototype.destroyEntity = function(id) {
  this.entities.destroy(id);
};

Game.prototype.replaceState = function(state) {
  this.entities.setState(state);
};
