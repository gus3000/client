'use strict';

var settingsFrom = require('./settings');

/**
 * Reads the Hypothesis configuration from the environment.
 *
 * @param {Window} window_ - The Window object to read config from.
 */
function configFrom(window_) {
  var settings = settingsFrom(window_);
  return {
    app: settings.app,
    query: settings.query,
    annotations: settings.annotations,
    showHighlights: settings.showHighlights,
    openLoginForm: settings.hostPageSetting('openLoginForm', {allowInBrowserExt: true}),
    openSidebar: settings.hostPageSetting('openSidebar', {allowInBrowserExt: true}),
    branding: settings.hostPageSetting('branding'),
    services: settings.hostPageSetting('services'),
  };
}

module.exports = configFrom;
