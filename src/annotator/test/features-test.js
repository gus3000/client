'use strict';

var events = require('../../shared/bridge-events');
var features = require('../features');

describe('features - annotation layer', function () {

  beforeEach(function () {
    sinon.stub(console, 'warn');
    // initial default features
    features.set({
      feature_on: true,
      feature_off: false,
    });
  });

  afterEach(function () {
    console.warn.restore();
    features.reset();
  });

  it('should add crossframe listener to set features state', function (){
    var fakeCrossframe = {
      on: sinon.spy(),
    };

    sinon.spy(features, 'set');

    features.init(fakeCrossframe);

    // called crossframe with correct event and a callback to set
    assert.calledOnce(fakeCrossframe.on);
    assert.equal(fakeCrossframe.on.firstCall.args[0], events.FEATURE_FLAGS_UPDATED);

    var crossFrameCallback = fakeCrossframe.on.firstCall.args[1];

    crossFrameCallback({ feature_x: true });

    assert.calledOnce(features.set);
    assert.calledWith(features.set, { feature_x: true });

    features.set.restore();
  });

  describe('flagEnabled', function () {
    it('should retrieve features data', function () {
      assert.equal(features.flagEnabled('feature_on'), true);
      assert.equal(features.flagEnabled('feature_off'), false);
    });

    it('should return false if features have not been loaded', function () {
      // simulate feature data not having been loaded yet
      features.reset();
      assert.equal(features.flagEnabled('feature_on'), false);
    });

    it('should return false for unknown flags', function () {
      assert.isFalse(features.flagEnabled('unknown_feature'));
    });

    it('should warn when accessing unknown flags', function () {
      assert.notCalled(console.warn);
      assert.isFalse(features.flagEnabled('unknown_feature'));
      assert.calledOnce(console.warn);
      assert.calledWith(console.warn, 'looked up unknown feature');
    });
  });
});
