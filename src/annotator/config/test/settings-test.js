'use strict';

var proxyquire = require('proxyquire');
var util = require('../../../shared/test/util');

var fakeConfigFuncSettingsFrom = sinon.stub();
var fakeIsBrowserExtension = sinon.stub();
var fakeSharedSettings = {};

var settingsFrom = proxyquire('../settings', util.noCallThru({
  './config-func-settings-from': fakeConfigFuncSettingsFrom,
  './is-browser-extension': fakeIsBrowserExtension,
  '../../shared/settings': fakeSharedSettings,
}));

describe('annotator.config.settingsFrom', function() {

  beforeEach('reset fakeConfigFuncSettingsFrom', function() {
    fakeConfigFuncSettingsFrom.reset();
    fakeConfigFuncSettingsFrom.returns({});
  });

  beforeEach('reset fakeIsBrowserExtension', function() {
    fakeIsBrowserExtension.reset();
    fakeIsBrowserExtension.returns(false);
  });

  beforeEach('reset fakeSharedSettings', function() {
    fakeSharedSettings.jsonConfigsFrom = sinon.stub().returns({});
  });

  describe('#sidebarAppUrl', function() {
    function appendLinkToDocument(href) {
      var link = document.createElement('link');
      link.type = 'application/annotator+html';
      if (href) {
        link.href = href;
      }
      document.head.appendChild(link);
      return link;
    }

    context("when there's an application/annotator+html link", function() {
      var link;

      beforeEach('add an application/annotator+html <link>', function() {
        link = appendLinkToDocument('http://example.com/app.html');
      });

      afterEach('tidy up the link', function() {
        document.head.removeChild(link);
      });

      it('returns the href from the link', function() {
        assert.equal(settingsFrom(window).sidebarAppUrl, 'http://example.com/app.html');
      });
    });

    context('when there are multiple annotator+html links', function() {
      var link1;
      var link2;

      beforeEach('add two links to the document', function() {
        link1 = appendLinkToDocument('http://example.com/app1');
        link2 = appendLinkToDocument('http://example.com/app2');
      });

      afterEach('tidy up the links', function() {
        document.head.removeChild(link1);
        document.head.removeChild(link2);
      });

      it('returns the href from the first one', function() {
        assert.equal(settingsFrom(window).sidebarAppUrl, 'http://example.com/app1');
      });
    });

    context('when the annotator+html link has no href', function() {
      var link;

      beforeEach('add an application/annotator+html <link> with no href', function() {
        link = appendLinkToDocument();
      });

      afterEach('tidy up the link', function() {
        document.head.removeChild(link);
      });

      it('throws an error', function() {
        assert.throws(
          function() {
            settingsFrom(window).sidebarAppUrl; // eslint-disable-line no-unused-expressions
          },
          'application/annotator+html link has no href'
        );
      });
    });

    context("when there's no annotator+html link", function() {
      it('throws an error', function() {
        assert.throws(
          function() {
            settingsFrom(window).sidebarAppUrl; // eslint-disable-line no-unused-expressions
          },
          'No application/annotator+html link in the document'
        );
      });
    });
  });

  function fakeWindow(href) {
    return {
      location: {
        href: href,
      },
      document: {
        querySelector: sinon.stub().returns({href: 'hi'}),
      },
    };
  }

  describe('#annotations', function() {
    context('when the host page has a js-hypothesis-config with an annotations setting', function() {
      beforeEach('add a js-hypothesis-config annotations setting', function() {
        fakeSharedSettings.jsonConfigsFrom.returns({annotations: 'annotationsFromJSON'});
      });

      it('returns the annotations from the js-hypothesis-config script', function() {
        assert.equal(settingsFrom(fakeWindow()).annotations, 'annotationsFromJSON');
      });

      context("when there's also an annotations in the URL fragment", function() {
        specify('js-hypothesis-config annotations override URL ones', function() {
          var window_ = fakeWindow('http://localhost:3000#annotations:annotationsFromURL');

          assert.equal(settingsFrom(window_).annotations, 'annotationsFromJSON');
        });
      });
    });

    [
      {
        describe: "when there's a valid #annotations:<ID> fragment",
        it: 'returns an object containing the annotation ID',
        url: 'http://localhost:3000#annotations:alphanum3ric_-only',
        returns: 'alphanum3ric_-only',
      },
      {
        describe: "when there's a non-alphanumeric annotation ID",
        it: 'returns null',
        url: 'http://localhost:3000#annotations:not%20alphanumeric',
        returns: null,
      },
      {
        describe: "when there's an unrecognised URL fragment",
        it: 'returns null',
        url: 'http://localhost:3000#unknown',
        returns: null,
      },
      {
        describe: "when there's no URL fragment",
        it: 'returns null',
        url: 'http://localhost:3000',
        returns: null,
      },
    ].forEach(function(test) {
      describe(test.describe, function() {
        it(test.it, function() {
          assert.deepEqual(
            settingsFrom(fakeWindow(test.url)).annotations, test.returns);
        });
      });
    });
  });

  describe('#query', function() {
    context('when the host page has a js-hypothesis-config with a query setting', function() {
      beforeEach('add a js-hypothesis-config query setting', function() {
        fakeSharedSettings.jsonConfigsFrom.returns({query: 'queryFromJSON'});
      });

      it('returns the query from the js-hypothesis-config script', function() {
        assert.equal(settingsFrom(fakeWindow()).query, 'queryFromJSON');
      });

      context("when there's also a query in the URL fragment", function() {
        specify('js-hypothesis-config queries override URL ones', function() {
          var window_ = fakeWindow('http://localhost:3000#annotations:query:queryFromUrl');

          assert.equal(settingsFrom(window_).query, 'queryFromJSON');
        });
      });
    });

    [
      {
        describe: "when there's a #annotations:query:<QUERY> fragment",
        it: 'returns an object containing the query',
        url: 'http://localhost:3000#annotations:query:user:fred',
        returns: 'user:fred',
      },
      {
        describe: "when there's a #annotations:q:<QUERY> fragment",
        it: 'returns an object containing the query',
        url: 'http://localhost:3000#annotations:q:user:fred',
        returns: 'user:fred',
      },
      {
        describe: "when there's a #annotations:QuerY:<QUERY> fragment",
        it: 'returns an object containing the query',
        url: 'http://localhost:3000#annotations:QuerY:user:fred',
        returns: 'user:fred',
      },
      {
        describe: 'when the query contains both a username and a tag',
        it: 'returns an object containing the query',
        url: 'http://localhost:3000#annotations:q:user:fred%20tag:foo',
        returns: 'user:fred tag:foo',
      },
      {
        describe: 'when the query contains URI escape sequences',
        it: 'decodes the escape sequences',
        url: 'http://localhost:3000#annotations:query:foo%20bar',
        returns: 'foo bar',
      },
      {
        describe: "when there's an unrecognised URL fragment",
        it: 'returns null',
        url: 'http://localhost:3000#unknown',
        returns: null,
      },
      {
        describe: "when there's no URL fragment",
        it: 'returns null',
        url: 'http://localhost:3000',
        returns: null,
      },
    ].forEach(function(test) {
      describe(test.describe, function() {
        it(test.it, function() {
          assert.deepEqual(
            settingsFrom(fakeWindow(test.url)).query, test.returns);
        });
      });
    });

    describe('when the URL contains an invalid fragment', function() {
      var decodeURI;

      beforeEach('make decodeURI throw an error', function() {
        decodeURI = sinon.stub(window, 'decodeURI').throws();
      });

      afterEach('reset decodeURI', function() {
        decodeURI.reset();
      });

      it('returns null', function() {
        // Note: we need a #annotations:query:* fragment here, not just a
        // #annotations:* one or an unrecognised one, otherwise
        // query() won't try to URI-decode the fragment.
        var url = 'http://localhost:3000#annotations:query:abc123';

        assert.isNull(settingsFrom(fakeWindow(url)).query);
      });
    });
  });

  describe('#hostPageSetting', function() {
    [
      {
        when: 'the client is embedded in a web page',
        specify: 'it returns setting values from window.hypothesisConfig()',
        isBrowserExtension: false,
        configFuncSettings: {foo: 'configFuncValue'},
        jsonSettings: {},
        expected: 'configFuncValue',
      },
      {
        when: 'the client is embedded in a web page',
        specify: 'it returns setting values from js-hypothesis-config objects',
        isBrowserExtension: false,
        configFuncSettings: {},
        jsonSettings: {foo: 'jsonValue'},
        expected: 'jsonValue',
      },
      {
        when: 'the client is embedded in a web page',
        specify: 'hypothesisConfig() settings override js-hypothesis-config ones',
        isBrowserExtension: false,
        configFuncSettings: {foo: 'configFuncValue'},
        jsonSettings: {foo: 'jsonValue'},
        expected: 'configFuncValue',
      },
      {
        when: 'the client is embedded in a web page',
        specify: 'even a null from hypothesisConfig() overrides js-hypothesis-config',
        isBrowserExtension: false,
        configFuncSettings: {foo: null},
        jsonSettings: {foo: 'jsonValue'},
        expected: null,
      },
      {
        when: 'the client is embedded in a web page',
        specify: 'even an undefined from hypothesisConfig() overrides js-hypothesis-config',
        isBrowserExtension: false,
        configFuncSettings: {foo: undefined},
        jsonSettings: {foo: 'jsonValue'},
        expected: undefined,
      },
      {
        when: 'the client is embedded in a web page',
        specify: "it returns undefined if the setting isn't defined anywhere",
        isBrowserExtension: false,
        configFuncSettings: {},
        jsonSettings: {},
        expected: undefined,
      },
      {
        when: 'the client is in a browser extension',
        specify: 'it always returns null',
        isBrowserExtension: true,
        configFuncSettings: {foo: 'configFuncValue'},
        jsonSettings: {foo: 'jsonValue'},
        expected: null,
      },
      {
        when: 'the client is in a browser extension and allowInBrowserExt: true is given',
        specify: 'it returns settings from window.hypothesisConfig()',
        isBrowserExtension: true,
        allowInBrowserExt: true,
        configFuncSettings: {foo: 'configFuncValue'},
        jsonSettings: {},
        expected: 'configFuncValue',
      },
      {
        when: 'the client is in a browser extension and allowInBrowserExt: true is given',
        specify: 'it returns settings from js-hypothesis-configs',
        isBrowserExtension: true,
        allowInBrowserExt: true,
        configFuncSettings: {},
        jsonSettings: {foo: 'jsonValue'},
        expected: 'jsonValue',
      },
    ].forEach(function(test) {
      context(test.when, function() {
        specify(test.specify, function() {
          fakeIsBrowserExtension.returns(test.isBrowserExtension);
          fakeConfigFuncSettingsFrom.returns(test.configFuncSettings);
          fakeSharedSettings.jsonConfigsFrom.returns(test.jsonSettings);
          var settings = settingsFrom(fakeWindow());

          var setting = settings.hostPageSetting(
            'foo',
            {allowInBrowserExt: test.allowInBrowserExt || false}
          );

          assert.equal(setting, test.expected);
        });
      });
    });
  });
});
