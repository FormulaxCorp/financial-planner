/* ============================================
   Firebase Authentication
   ============================================ */
const FirebaseAuth = (() => {
  'use strict';

  let currentUser = null;

  // Wait for auth state to be ready
  function waitForAuth() {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        currentUser = user;
        unsubscribe();
        resolve(user);
      });
    });
  }

  // Login with email/password
  async function login(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      currentUser = userCredential.user;
      return { success: true, user: currentUser };
    } catch (error) {
      let message = 'Login gagal!';
      if (error.code === 'auth/user-not-found') message = 'Email tidak terdaftar!';
      else if (error.code === 'auth/wrong-password') message = 'Password salah!';
      else if (error.code === 'auth/invalid-email') message = 'Email tidak valid!';
      else if (error.code === 'auth/too-many-requests') message = 'Terlalu banyak percobaan. Coba lagi nanti.';
      return { success: false, message };
    }
  }

  // Register new user
  async function register(email, password, displayName) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      currentUser = userCredential.user;
      if (displayName) {
        await currentUser.updateProfile({ displayName });
      }
      return { success: true, user: currentUser };
    } catch (error) {
      let message = 'Registrasi gagal!';
      if (error.code === 'auth/email-already-in-use') message = 'Email sudah terdaftar!';
      else if (error.code === 'auth/weak-password') message = 'Password minimal 6 karakter!';
      return { success: false, message };
    }
  }

  // Logout
  async function logout() {
    await auth.signOut();
    currentUser = null;
  }

  // Get current user
  function getUser() {
    return currentUser;
  }

  // Check if logged in
  function isLoggedIn() {
    return !!currentUser;
  }

  return {
    waitForAuth,
    login,
    register,
    logout,
    getUser,
    isLoggedIn
  };
})();
