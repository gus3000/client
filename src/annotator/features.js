'use strict';

const events = require('../shared/bridge-events');

let _features = {};

module.exports = {

  init: function(crossframe) {
    crossframe.on(events.FEATURE_FLAGS_UPDATED, this.set);
  },

  set: function(features) {
    _features = features || {};
  },

  reset: function() {
    this.set({});
  },

  flagEnabled: function(flag) {
    if (!(flag in _features)) {
      console.warn('looked up unknown feature', flag);
      return false;
    }
    return _features[flag];
  },

};
