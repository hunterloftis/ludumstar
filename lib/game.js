var Loop = require('./loop/loop');
var EntityGroup = require('./entity-group');
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

var noNetwork = {

};

function Game(renderer, keyboard, network) {
  this.renderer = renderer || noRenderer;
  this.keyboard = keyboard || noKeyboard;
  this.network = network || noNetwork;
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

Game.prototype.start = function() {
  var entities = this.entities;
  var keyboard = this.keyboard;
  var renderer = this.renderer;

  this.channel.sub('shooting/fire', this.createMissile.bind(this));
  this.channel.sub('explosive/die', this.destroyEntity.bind(this));

  this.network.on('state', this.getNetworkState.bind(this));

  this.loop.start(simulate.bind(this), render.bind(this));

  function simulate(seconds) {
    entities.update('verlet', [ seconds ]);
    entities.update('controllable', [ seconds, keyboard.getState() ]);
    entities.update('flying', [ seconds ]);
    entities.update('shooting', [ seconds, this.channel ]);
    entities.update('explosive', [ seconds, this.channel ]);
    entities.update('destroyable', [ seconds ]);
  }

  function render(seconds) {
    renderer.render(seconds, entities.getState(), 'player');
  }
};

Game.prototype.createMissile = function(position) {
  var entity = this.entities.create([ 'position', 'missile', 'verlet', 'explosive' ]);
  this.entities.getSystem('position').set(entity, position);
};

Game.prototype.destroyEntity = function(id) {
  this.entities.destroy(id);
};

Game.prototype.getNetworkState = function(state) {
  this.entities.setState(state);
};
