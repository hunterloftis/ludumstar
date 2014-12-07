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

System.prototype._update = function(entities, args) {
  var update = this.update;
  var name = this.name;

  entities.forEach(updateIfMatch);

  function updateIfMatch(entity) {
    if (entity.systems.indexOf(name) === -1) return;
    update.apply(entity, args);
  }
};
