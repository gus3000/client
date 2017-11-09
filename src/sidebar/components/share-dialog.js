'use strict';

var VIA_PREFIX = 'https://via.hypothes.is/';

// @ngInject
function ShareDialogController($scope, $element, analytics, annotationUI, settings) {
  var self = this;

  function updateViaLink(frames) {
    if (!frames.length) {
      self.viaPageLink = '';
      return;
    }

    var viaPrefix = settings.viaUrl || VIA_PREFIX;

    // Check to see if we are on a via page. If so, we just return the URI.
    if (frames[0].uri.indexOf(viaPrefix) === 0) {
      self.viaPageLink = frames[0].uri;
    } else {
      self.viaPageLink = viaPrefix + frames[0].uri;
    }
  }

  var viaInput = $element[0].querySelector('.js-via');
  viaInput.focus();
  viaInput.select();

  $scope.$watch(function () { return annotationUI.frames(); },
    updateViaLink);

  $scope.onShareClick = function(target){
    if(target){
      analytics.track(analytics.events.DOCUMENT_SHARED, target);
    }
  };
}

module.exports = {
  controller: ShareDialogController,
  controllerAs: 'vm',
  bindings: {
    onClose: '&',
  },
  template: require('../templates/share-dialog.html'),
};
