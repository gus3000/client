'use strict';

/* global Uint8Array */

var queryString = require('query-string');

var resolve = require('./util/url-util').resolve;
var serviceConfig = require('./service-config');

/**
 * An object holding the details of an access token from the tokenUrl endpoint.
 *
 * This object is serialized for use in the future client sessions, so all
 * fields must be JSON-serializable.
 *
 * @typedef {Object} TokenInfo
 * @property {string} accessToken  - The access token itself.
 * @property {number} expiresAt    - The Unix timestamp when the access token will
 *                                   expire. In milliseconds.
 * @property {string} refreshToken - The refresh token that can be used to
 *                                   get a new access token.
 */

/**
 * Generate a random hex string of `len` chars.
 *
 * @param {number} - An even-numbered length string to generate.
 * @return {string}
 */
function randomHexString(len) {
  var bytes = new Uint8Array(len / 2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(function (byte) {
    return byte.toString(16);
  }).join('');
}

function getAuthority(settings) {
  var cfg = serviceConfig(settings);
  return cfg ? cfg.authority : 'default';
}

/**
 * OAuth-based authorization service.
 *
 * This service handles:
 *
 *  - Exchanging grant tokens provided either by the publisher or the service's
 *    authorization endpoint for access token.
 *  - Launching the OAuth authorization flow when `login()` is called.
 *  - Persisting credentials for use in future sessions.
 */
// @ngInject
function auth($http, flash, localStorage, settings) {

  /**
   * Grant token returned by the OAuth authorization endpoint after the
   * last call to `login()`.
   */
  var grantTokenFromAuthWindow;
  var accessTokenPromise;

  /**
   * Endpoint which can exchange grant tokens for access tokens.
   */
  var tokenUrl = resolve('token', settings.apiUrl);

  /**
   * Show an error message telling the user that the access token has expired.
   */
  function showAccessTokenExpiredErrorMessage(message) {
    flash.error(
      message,
      'Hypothesis login lost',
      {
        extendedTimeOut: 0,
        tapToDismiss: false,
        timeOut: 0,
      }
    );
  }

  function grantTokenProvidedByHostPage() {
    var cfg = serviceConfig(settings);
    return cfg ? cfg.grantToken : null;
  }

  /**
   * Return the localStorage key used for token data.
   */
  function storageKey(authority) {
    return 'hypothesis:oauth:' + authority + ':token';
  }

  /**
   * Read the last-used access and refresh tokens for a given authority from
   * storage.
   *
   * @param {string} authority
   * @return {TokenInfo}
   */
  function readLastUsedToken(authority) {
    try {
      var { accessToken, expiresAt, refreshToken } = JSON.parse(
        localStorage.getItem(storageKey(authority))
      );

      if (typeof accessToken !== 'string' ||
          typeof expiresAt !== 'number' ||
          typeof refreshToken !== 'string') {
        throw new Error('Invalid token');
      }

      return { accessToken, expiresAt, refreshToken };
    } catch (e) {
      return null;
    }
  }

  /**
   * Persist the last-used access and refresh tokens for a given authority to
   * storage.
   *
   * @param {string} authority
   * @param {TokenInfo} token
   */
  function saveLastUsedToken(authority, token) {
    try {
      var json = JSON.stringify(token);
      localStorage.setItem(storageKey(authority), json);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Return a new TokenInfo object from the given tokenUrl endpoint response.
   * @param {Object} response - The HTTP response from a POST to the tokenUrl
   *                            endpoint (an Angular $http response object).
   * @returns {TokenInfo}
   */
  function tokenInfoFrom(response) {
    var data = response.data;
    return {
      accessToken:  data.access_token,

      // Set the expiry date to some time before the time represented by
      // `now + expires_in` so that the client will refresh the token before it
      // actually expires.
      expiresAt:    Date.now() + (data.expires_in * 1000 * 0.91),

      refreshToken: data.refresh_token,
    };
  }

  /**
   * Make a POST request to `url` with form URL encoded parameters.
   *
   * @param {string} url
   * @param {Object} params - Parameter dictionary.
   */
  function postForm(url, params) {
    params = queryString.stringify(params);
    var requestConfig = {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    };
    return $http.post(url, params, requestConfig);
  }

  // Exchange the JWT grant token for an access token.
  // See https://tools.ietf.org/html/rfc7523#section-4
  function exchangeToken(grantToken) {
    var data = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: grantToken,
    };
    return postForm(tokenUrl, data).then(function (response) {
      if (response.status !== 200) {
        throw new Error('Failed to retrieve access token');
      }
      return tokenInfoFrom(response);
    });
  }

  // Exchange the refresh token for a new access token and refresh token pair.
  // See https://tools.ietf.org/html/rfc6749#section-6
  function refreshAccessToken(refreshToken) {
    var data = {grant_type: 'refresh_token', refresh_token: refreshToken};
    postForm(tokenUrl, data).then(function (response) {
      var tokenInfo = tokenInfoFrom(response);
      saveLastUsedToken(getAuthority(), tokenInfo);
      refreshAccessTokenBeforeItExpires(tokenInfo);
      accessTokenPromise = Promise.resolve(tokenInfo.accessToken);
    }).catch(function() {
      showAccessTokenExpiredErrorMessage(
        'You must reload the page to continue annotating.');
    });
  }

  // Set a timeout to refresh the access token a few minutes before it expires.
  function refreshAccessTokenBeforeItExpires(tokenInfo) {
    // The delay, in milliseconds, before we will poll again to see if it's
    // time to refresh the access token.
    var delay = 30000;

    // If the token info's refreshAfter time will have passed before the next
    // time we poll, then refresh the token this time.
    var refreshAfter = tokenInfo.expiresAt - delay;

    function refreshAccessTokenIfNearExpiry() {
      if (Date.now() > refreshAfter) {
        refreshAccessToken(tokenInfo.refreshToken);
      } else {
        refreshAccessTokenBeforeItExpires(tokenInfo);
      }
    }

    window.setTimeout(refreshAccessTokenIfNearExpiry, delay);
  }

  function tokenGetter() {
    if (!accessTokenPromise) {
      var grantToken = grantTokenProvidedByHostPage() || grantTokenFromAuthWindow;

      if (grantToken) {
        accessTokenPromise = exchangeToken(grantToken).then(function (tokenInfo) {
          refreshAccessTokenBeforeItExpires(tokenInfo);
          return tokenInfo.accessToken;
        }).catch(function(err) {
          showAccessTokenExpiredErrorMessage(
            'You must reload the page to annotate.');
          throw err;
        });
      } else {
        accessTokenPromise = Promise.resolve(null);
      }
    }

    return accessTokenPromise;
  }

  // clearCache() isn't implemented (or needed) yet for OAuth.
  // In the future, for example when OAuth-authenticated users can login and
  // logout of the client, this clearCache() will need to clear the access
  // token and cancel any scheduled refresh token requests.
  function clearCache() {
  }

  /**
   * Login to the annotation service using OAuth.
   */
  function login() {
    // Random state string used to check that auth messages came from the popup
    // window that we opened.
    var state = randomHexString(16);

    // Promise which resolves or rejects when the user accepts or closes the
    // auth popup.
    var authResponse = new Promise(function (resolve, reject) {
      function authRespListener(event) {
        if (typeof event.data !== 'object') {
          return;
        }

        if (event.data.state !== state) {
          // This message came from a different popup window.
          return;
        }

        if (event.data.type === 'authorization_response') {
          resolve(event.data);
        }
        if (event.data.type === 'authorization_canceled') {
          reject(new Error('Authorization window was closed'));
        }
        window.removeEventListener('message', authRespListener);
      }
      window.addEventListener('message', authRespListener);
    });

    // Authorize user and retrieve grant token
    var width  = 400;
    var height = 400;
    var left   = window.screenX + ((window.innerWidth / 2)  - (width  / 2));
    var top    = window.screenY + ((window.innerHeight / 2) - (height / 2));

    var authUrl = settings.oauth.authUrl;
    authUrl += '?' + queryString.stringify({
      client_id: settings.oauth.clientId,
      origin: location.origin,
      response_mode: 'web_message',
      response_type: 'code',
      state: state,
    });
    var authWindowSettings = queryString.stringify({
      left: left,
      top: top,
      width: width,
      height: height,
    }).replace(/&/g, ',');
    window.open(authUrl, 'Login to Hypothesis', authWindowSettings);

    return authResponse.then(function (resp) {
      // Save the grant token. It will be exchanged for an access token when the
      // next API request is made.
      grantTokenFromAuthWindow = resp.code;
      accessTokenPromise = null;
    });
  }

  /**
   * Attempt to log-in automatically.
   */
  function autoLogin() {
    return postForm(settings.oauth.tokenUrl, {
      client_id: settings.oauth.clientId,
    }).then(tokenInfoFrom);
  }

  /**
   * Load credentials from the previous session, if available.
   */
  function init() {
    if (grantTokenProvidedByHostPage()) {
      // When the host page provides a grant token, we always use that instead
      // of any cached credentials.
      return;
    }

    var authority = getAuthority(settings);
    var lastToken = readLastUsedToken(authority);
    if (lastToken) {
      // Re-use existing saved credentials.
      accessTokenPromise = Promise.resolve(lastToken.accessToken);
      refreshAccessTokenBeforeItExpires(lastToken);
    } else {
      // Attempt to login automatically.
      accessTokenPromise = autoLogin().then((token) => {
        saveLastUsedToken(authority, token);
        refreshAccessTokenBeforeItExpires(token);
        return token.accessToken;
      }).catch(() => {
        // Fall back to requiring manually triggered login.
        return null;
      });
    }
  }

  init();

  return {
    clearCache: clearCache,
    login: login,
    tokenGetter: tokenGetter,
  };
}

module.exports = auth;
