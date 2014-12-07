var _ = require('lodash');

module.exports = System;

function System(definition) {
  _.extend(this, definition);
}

System.prototype._extend = function(entity) {
  _.extend(entity, _.cloneDeep(this.state));
};

System.prototype._unextend = function(entity) {
  Object.keys(this.state).forEach(removeState);

  function removeState(key) {
    entity[key] = undefined;
  }
};

System.prototype._update = function(entities, systems, args) {
  var update = this.update;
  var name = this.name;

  entities.forEach(updateIfMatch);

  function updateIfMatch(entity) {
    if (!entity) return;  // in case of removal?
    if (entity.systems.indexOf(name) === -1) return;
    update.apply(systems, [entity].concat(args));
  }
};

System.prototype._addFunctions = function(target) {
  Object.keys(this).forEach(addFunction.bind(this));

  function addFunction(key) {
    if (key.charAt(0) === '_') return;
    if (typeof this[key] !== 'function') return;
    target[key] = this[key];
  }
};
