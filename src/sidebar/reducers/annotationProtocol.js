/**
 * State management for the annotation Protocol.
 */

'use strict';

var util = require('./util');

function init(settings) {
  console.log("ANNOTATION PROTOCOL INIT", settings);
  const annotProtocol = (settings.annotationProtocol || []).reduce(function(resProt, catDef) {
    resProt[catDef.name.toLowerCase()] = catDef;
    return resProt;
  }, {});
  return {
    annotationProtocol: annotProtocol,
  };
}

// Empty for the moment
var update = {

};

var actions = util.actionTypes(update);

module.exports = {
  init: init,
  update: update,
  actions: {
  },

  // Selectors
};

