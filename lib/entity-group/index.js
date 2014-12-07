var _ = require('lodash');

var System = require('./system');

module.exports = Group;

function Group(definitions) {
  this.systems = {};
  this._entities = [];
  this._systems = Object.keys(definitions).reduce(toObject.bind(this), {});

  function toObject(obj, key) {
    var name = definitions[key].name;
    var def = definitions[key];
    obj[name] = new System(def);
    obj[name]._addFunctions(this.systems);
    return obj;
  }
}

Group.prototype.create = function(id, components) {
  if (!components) {
    components = id;
    id = Math.floor(Math.random() * 9999999);
  }

  var entity = {
    id: id,
    systems: components
  };

  components.forEach(this.addComponent.bind(this, entity))
  this._entities.push(entity);
  return entity;
};

Group.prototype.addComponent = function(entity, component) {
  var system = this.getSystem(component);
  if (!system) throw new Error('No registered component: ' + component);
  system._extend(entity);
};

Group.prototype.destroy = function(id) {
  var index = _.findIndex(this._entities, { id: id });
  var entity = this._entities[index];
  this._entities.splice(index, 1);
  return entity;
};

Group.prototype.getSystem = function(name) {
  return this._systems[name];
};

Group.prototype.update = function(name, args) {
  var system = this._systems[name];
  system._update(this._entities, this.systems, args);
};

Group.prototype.getState = function() {
  return this._entities;
};

Group.prototype.setState = function(state) {
  this._entities = state;
};

Group.prototype.get = function(id) {
  return _.find(this._entities, { id: id });
};

Group.prototype.set = function(id, state) {
  var index = _.findIndex(this._entities, { id: id });
  if (index !== -1) this._entities[index] = state;
};

Group.prototype.getAll = function() {
  return this._entities;
};

Group.prototype.findAll = function(component) {
  return this._entities.filter(match);

  function match(entity) {
    if (entity.systems.indexOf(component) !== -1) return true;
  }
};
