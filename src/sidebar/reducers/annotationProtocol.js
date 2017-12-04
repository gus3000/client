/**
 * State management for the annotation Protocol.
 */

'use strict';

var util = require('./util');

function init(settings) {
  const annotProtocol = (settings.annotationProtocol || []).reduce(function(resProt, catDef) {
    resProt[catDef.name.toLowerCase()] = Object.assign({priority: 0}, catDef);
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

function sortedProtocolList(state) {
  const annotationProtocol = state.annotationProtocol;
  const sortedProtocol = Object.keys(annotationProtocol).reduce(function(previousList, key) {
    previousList.push(Object.assign({key: key}, annotationProtocol[key]));
    return previousList;
  }, []);
  return sortedProtocol.sort(function(cat1, cat2) { return (cat2.priority || 0) - (cat1.priority || 0); });
}

function getTagColor(state, tag) {
  const annotationProtocol = state.annotationProtocol;
  if(tag && tag.startsWith('cat:')) {
    const tagKey = tag.slice(4).toLowerCase();
    if(tagKey in annotationProtocol) {
      return (annotationProtocol[tagKey].color || null);
    }
  }
  return null;
}


module.exports = {
  init: init,
  update: update,
  actions: {
  },

  // Selectors
  sortedProtocolList: sortedProtocolList,
  getTagColor: getTagColor,
};

