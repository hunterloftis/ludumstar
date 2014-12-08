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
  require('./systems/team'),
  require('./systems/points'),
  require('./systems/powerup')
];

var RANGE = 5000;

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

  this.entities.create('redTeam', [ 'team', 'points' ], { team: 'red' });
  this.entities.create('blueTeam', [ 'team', 'points' ], { team: 'blue' });
}

Game.prototype = Object.create(EventEmitter.prototype);

Game.prototype.start = function() {
  var entities = this.entities;
  var keyboard = this.keyboard;
  var renderer = this.renderer;

  this.channel.on('shooting/fire', this.createMissile.bind(this));
  this.channel.on('explosive/die', this.destroyEntity.bind(this));
  this.channel.on('powerup/die', this.destroyEntity.bind(this));
  this.channel.on('destroyable/die', this.destroyDestroyable.bind(this));

  this.loop.start(simulate.bind(this), render.bind(this));

  function simulate(seconds) {
    entities.update('verlet', [ seconds ]);
    entities.update('controllable', [ seconds, keyboard.getState(), this.playerId ]);
    entities.update('flying', [ seconds, this.playerId ]);
    entities.update('shooting', [ seconds, this.channel ]);
    entities.update('explosive', [ seconds, entities.getAll(), this.channel ]);
    entities.update('destroyable', [ seconds, this.channel ]);
    entities.update('position', [ seconds, RANGE ]);
    entities.update('powerup', [ seconds, entities.getAll(), this.channel ]);
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

Game.prototype.destroyDestroyable = function(entity) {
  if (entity.lastAttackerId) {
    var attacker = this.entities.get(entity.lastAttackerId);
    attacker.points++;
  }
  var teamName = entity.team === 'red' ? 'blueTeam' : 'redTeam';
  var team = this.entities.get(teamName);
  if (team) {
    team.points++;
    if (team.points > 7) {
      this.entities.get('redTeam').points = 0;
      this.entities.get('blueTeam').points = 0;
    }
  }
  this.entities.destroy(entity.id);
};

Game.prototype.replaceState = function(state) {
  var blendSpeed = 0.25;
  var entities = this.entities;
  state.forEach(blendState);

  function blendState(remote) {
    var local = entities.get(remote.id);
    if (local) {
      if (local.angle && remote.angle) {
        var da = remote.angle - local.angle;
        remote.angle = local.angle + da * blendSpeed; // smooth out rotation
      }
      if (local.x && remote.x) {
        entities.systems.blendPosition(remote, local, 0.5);
      }
    }
  }

  var storedPlayer = this.playerId ? this.entities.get(this.playerId) : undefined;
  this.entities.setState(state);
  if (storedPlayer) {
    var newPlayer = this.entities.get(this.playerId);
    if (newPlayer) {
      newPlayer.x = storedPlayer.x;
      newPlayer.y = storedPlayer.y;
      newPlayer.interval = storedPlayer.interval;
      newPlayer.angle = storedPlayer.angle;
      newPlayer.leftActive = storedPlayer.false,
      newPlayer.rightActive = storedPlayer.rightActive;
      newPlayer.forwardActive = storedPlayer.forwardActive;
      newPlayer.reverseActive = storedPlayer.reverseActive;
      newPlayer.fireActive = storedPlayer.fireActive;
    }
    // this.entities.set(this.playerId, player);
  }
};

Game.prototype.createPlayer = function(team) {
  var player = this.entities.create([
    'position', 'controllable', 'ship', 'verlet', 'flying', 'destroyable', 'shooting', 'team', 'points'
  ]);
  var everyone = this.entities.findAll('ship');
  if (team) {
    player.team = team;
  }
  else {
    var reds = _.filter(everyone, { team: 'red' }).length;
    var blues = _.filter(everyone, { team: 'blues' }).length;
    player.team = reds > blues ? 'blue' : 'red';
  }
  var angle = Math.random() * Math.PI * 2;
  var distance = Math.random() * 256;
  player.x[0] = Math.cos(angle) * distance;
  player.y[0] = Math.sin(angle) * distance;
  player.angle = angle + Math.PI * 0.5;
  console.log('player team:', player.team, '- total players:', everyone.length);
  return player;
};

Game.prototype.createPowerup = function(type) {
  var powerup = this.entities.create([ 'position', 'verlet', 'powerup' ])
  powerup.powerupType = type;
  var angle = Math.random() * Math.PI * 2;
  var distance = Math.random() * RANGE * 0.2;
  powerup.x[0] = Math.cos(angle) * distance;
  powerup.y[0] = Math.sin(angle) * distance;
  return powerup;
};

Game.prototype.setId = function(id) {
  this.playerId = id;
};
