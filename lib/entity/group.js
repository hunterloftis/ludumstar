var _ = require('lodash');

var System = require('./system');

module.exports = Group;

function Group(definitions) {
  this.entities = [];
  this.systems = Object.keys(definitions).reduce(toObject, {});

  function toObject(obj, key) {
    var name = definitions[key].name;
    var def = definitions[key];
    obj[name] = new System(def);
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
  this.entities.push(entity);
  return entity;

  function extendEntity(component) {
    var system = this.getSystem(component);
    system._extend(entity);
  }
};

Group.prototype.destroy = function(id) {
  var index = _.findIndex(this.entities, { id: id });
  var entity = this.entities[index];
  this.entities.splice(index, 1);
  return entity;
};

Group.prototype.getSystem = function(name) {
  return this.systems[name];
};

Group.prototype.update = function(name, args) {
  var system = this.systems[name];
  system._update(this.entities, args);
};

Group.prototype.getState = function() {
  return this.entities;
};

Group.prototype.setState = function(state) {
  this.entities = state;
};
