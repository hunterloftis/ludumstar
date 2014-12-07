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

  components.forEach(extendEntity.bind(this));
  this._entities.push(entity);
  return entity;

  function extendEntity(component) {
    var system = this.getSystem(component);
    system._extend(entity);
  }
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
  this._entities[index] = state;
};
