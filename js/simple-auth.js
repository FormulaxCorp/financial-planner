/* Simple Password Authentication */
var SimpleAuth = (function() {
  'use strict';
  var STORED_PASSWORD='pulupulu2610';
  var SESSION_KEY = 'fp_auth_session';
  var SESSION_DURATION = 604800000;

  function isSessionValid() {
    try {
      var s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (!s) return false;
      if (Date.now() > s.expiresAt) { sessionStorage.removeItem(SESSION_KEY); return false; }
      return true;
    } catch (e) { return false; }
  }

  function createSession() {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      authenticated: true, expiresAt: Date.now() + SESSION_DURATION
    }));
  }

  async function login(password) {
    if (password === STORED_PASSWORD) { createSession(); return { success: true }; }
    return { success: false, message: 'Password salah!' };
  }

  function isLoggedIn() { return isSessionValid(); }
  function logout() { sessionStorage.removeItem(SESSION_KEY); }

  return { login: login, isLoggedIn: isLoggedIn, logout: logout };
})();
