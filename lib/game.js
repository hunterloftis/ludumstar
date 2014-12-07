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

  this.playerId = undefined;
  this.renderer = renderer || noRenderer;
  this.keyboard = keyboard || noKeyboard;
  this.loop = new Loop(180);
  this.channel = new Preach();

  this.entities = new EntityGroup(SYSTEMS);
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
    entities.update('controllable', [ seconds, keyboard.getState(), this.playerId ]);
    entities.update('flying', [ seconds, this.playerId ]);
    entities.update('shooting', [ seconds, this.channel ]);
    entities.update('explosive', [ seconds, this.channel ]);
    entities.update('destroyable', [ seconds ]);
    entities.update('position', [ seconds ]);
  }

  function render(seconds) {
    var state = entities.getState();
    renderer.render(seconds, state, this.playerId);
    var playerState = this.playerId ? entities.get(this.playerId) : undefined;
    this.emit('render', seconds, state, playerState);
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
  var blendSpeed = 0.25;
  var entities = this.entities;
  state.forEach(blendState);

  function blendState(remote) {
    var local = entities.get(remote.id);
    if (local) {
      if (local.angle && remote.angle) {
        remote.angle = local.angle + (remote.angle - local.angle) * blendSpeed; // smooth out rotation
      }
    }
  }

  var player = this.playerId ? this.entities.get(this.playerId) : undefined;
  this.entities.setState(state);
  if (player) this.entities.set(this.playerId, player);
};

Game.prototype.createPlayer = function() {
  var player = this.entities.create([
    'position', 'controllable', 'ship', 'verlet', 'flying', 'destroyable', 'shooting'
  ]);
  return player.id;
};

Game.prototype.setId = function(id) {
  this.playerId = id;
};
