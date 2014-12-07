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
  var entity = new Entity(id, this);
  this.entities.push(entity);
  return entity;
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
