var Loop = require('./loop/loop');
var EntityGroup = require('./entity-group');
var Pubsub = require('event-pubsub');
var EventEmitter = require('eventemitter2').EventEmitter2;
var _ = require('lodash');

var SYSTEMS = [
  require('./systems/position'),
  require('./systems/controllable'),
  require('./systems/ship'),
  require('./systems/verlet'),
  require('./systems/flying'),
  require('./systems/destroyable'),
  require('./systems/shooting'),
  require('./systems/explosive'),
  require('./systems/missile'),
  require('./systems/team')
];

var RANGE = 7000;

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
  this.channel = new Pubsub();

  this.entities = new EntityGroup(SYSTEMS);
}

Game.prototype = Object.create(EventEmitter.prototype);

Game.prototype.start = function() {
  var entities = this.entities;
  var keyboard = this.keyboard;
  var renderer = this.renderer;

  this.channel.on('shooting/fire', this.createMissile.bind(this));
  this.channel.on('explosive/die', this.destroyEntity.bind(this));
  this.channel.on('destroyable/die', this.destroyEntity.bind(this));

  this.loop.start(simulate.bind(this), render.bind(this));

  function simulate(seconds) {
    entities.update('verlet', [ seconds ]);
    entities.update('controllable', [ seconds, keyboard.getState(), this.playerId ]);
    entities.update('flying', [ seconds, this.playerId ]);
    entities.update('shooting', [ seconds, this.channel ]);
    entities.update('explosive', [ seconds, entities.getAll(), this.channel ]);
    entities.update('destroyable', [ seconds ]);
    entities.update('position', [ seconds, RANGE ]);
  }

  function render(seconds) {
    var state = entities.getState();
    renderer.render(seconds, state, this.playerId);
    var playerState = this.playerId ? entities.get(this.playerId) : undefined;
    this.emit('render', seconds, state, playerState);
  }
};

Game.prototype.createMissile = function(team, position) {
  var entities = this.entities;
  var entity = entities.create([ 'position', 'missile', 'verlet', 'explosive', 'team' ]);
  entity.team = team;
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
    'position', 'controllable', 'ship', 'verlet', 'flying', 'destroyable', 'shooting', 'team'
  ]);
  var everyone = this.entities.findAll('ship');
  var reds = _.filter(everyone, { team: 'red' }).length;
  var blues = _.filter(everyone, { team: 'blues' }).length;
  player.team = reds > blues ? 'blue' : 'red';
  console.log('player team:', player.team, '- total players:', everyone.length);
  return player.id;
};

Game.prototype.setId = function(id) {
  this.playerId = id;
};
