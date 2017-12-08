'use strict';

var angular = require('angular');

var util = require('../../directive/test/util');

describe('tagEditor', function () {
  var fakeTags;
  var fakeAnnotationUI;
  var fakeTemplateCache;

  before(function () {
    angular.module('app',[])
      .component('tagEditor', require('../tag-editor'));
  });

  beforeEach(function () {
    fakeTags = {
      filter: sinon.stub(),
      store: sinon.stub(),
    };
    fakeAnnotationUI = {
      getTagColor: sinon.stub().returns('#000000'),
    };
    fakeTemplateCache = {
      put: sinon.stub(),
    };

    angular.mock.module('app', {
      tags: fakeTags,
      annotationUI: fakeAnnotationUI,
      '$templateCache': fakeTemplateCache,
    });
  });

  it('converts tags to the form expected by ng-tags-input', function () {
    var element = util.createDirective(document, 'tag-editor', {
      tags: ['foo', 'bar'],
    });
    assert.deepEqual(element.ctrl.tagList, [{text: 'foo', label: 'foo', color: '#000000'}, {text: 'bar', label: 'bar', color: '#000000'}]);
  });

  describe('when tags are changed', function () {
    var element;
    var onEditTags;

    beforeEach(function () {
      onEditTags = sinon.stub();
      element = util.createDirective(document, 'tag-editor', {
        onEditTags: {args: ['tags'], callback: onEditTags},
        tags: ['foo'],
      });
      element.ctrl.onTagsChanged();
    });

    it('calls onEditTags handler', function () {
      assert.calledWith(onEditTags, sinon.match(['foo']));
    });

    it('saves tags to the store', function () {
      assert.calledWith(fakeTags.store, sinon.match([{text: 'foo', label: 'foo', color: '#000000'}]));
    });
  });

  describe('#autocomplete', function () {
    it('suggests tags using the `tags` service', function () {
      var element = util.createDirective(document, 'tag-editor', {tags: []});
      element.ctrl.autocomplete('query');
      assert.calledWith(fakeTags.filter, 'query');
    });
  });
});
