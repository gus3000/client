'use strict';

// var redux = require('redux');

var annotationProtocol = require('../annotationProtocol');

describe('sidebar.reducers.annotationProtocol', function() {

  describe('#init()', function() {
    it('returns a empty annotation protocol object', function() {
      assert.deepEqual(annotationProtocol.init({}), { annotationProtocol: {} });
    });

    it('returns an annotation protocol mapping form a list', function() {
      assert.deepEqual(annotationProtocol.init({
        annotationProtocol: [
          {
            name: 'cat1',
            color: '#000000',
            priority: 1,
          },
          {
            name: 'cat2',
            color: '#0000ff',
          },
        ],
      }), { annotationProtocol: {
        'cat1': {
          name: 'cat1',
          color: '#000000',
          priority: 1,
        },
        'cat2': {
          name: 'cat2',
          color: '#0000ff',
          priority: 0,
        },
      } });
    });
  });

  describe('#sortedProtocolList()', function() {
    it('returns a protocol list sorted by priority', function() {
      var sortedProtocolList = annotationProtocol.sortedProtocolList({
        annotationProtocol: {
          'cat1': {
            name: 'cat1',
            color: '#000000',
            priority: 0,
          },
          'cat2': {
            name: 'cat2',
            color: '#0000ff',
            priority: 0,
          },
          'cat3': {
            name: 'cat3',
            color: '#00ffff',
            priority: 1,
          },
        },
      });

      assert.deepEqual(sortedProtocolList, [
        {
          name: 'cat3',
          key: 'cat3',
          color: '#00ffff',
          priority: 1,
        },
        {
          name: 'cat1',
          key: 'cat1',
          color: '#000000',
          priority: 0,
        },
        {
          name: 'cat2',
          key: 'cat2',
          color: '#0000ff',
          priority: 0,
        },
      ]);
    });
  });

  describe('#getTagColor()', function() {
    var state = {
      annotationProtocol: {
        'cat1': {
          name: 'cat1',
          color: '#000000',
          priority: 0,
        },
        'cat2': {
          name: 'cat2',
          color: '#0000ff',
          priority: 0,
        },
        'cat3': {
          name: 'cat3',
          color: '#00ffff',
          priority: 1,
        },
      },
    };

    it('return a color for a known category', function() {
      var color = annotationProtocol.getTagColor(state, 'cat:cat3');
      assert.equal(color, '#00ffff');
    });

    it('return null for a unknown category', function() {
      var color = annotationProtocol.getTagColor(state, 'cat:cat4');
      assert.equal(color, null);
    });

    it('return null for a plain tag', function() {
      var color = annotationProtocol.getTagColor(state, 'foo');
      assert.equal(color, null);
    });

  });

});
