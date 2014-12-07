var _ = require('lodash');

var Entity = require('./entity');
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

Group.prototype.create = function(id) {
  id = id || Math.floor(Math.random() * 9999999);
  var entity = new Entity(id, this);
  this.entities.push(entity);
  return entity;
};

Group.prototype.destroy = function(id) {
  var index = _.findIndex(this.entities, { id: id });
  var entity = this.entities[index];
  this.entities.splice(index, 1);
  entity.destroy();
};

Group.prototype.getSystem = function(name) {
  return this.systems[name];
};

Group.prototype.update = function(name) {
  var system = this.systems[name];
  var args = Array.prototype.slice.call(arguments, 1);

  if (!system) throw new Error('No such system: ' + name);

  system.update(args);
};

Group.prototype.getState = function() {
  return this.entities.map(getEntityState);

  function getEntityState(entity) {
    return entity.getState();
  }
};
