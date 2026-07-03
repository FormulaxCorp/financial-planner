/* Supabase Client Initialization + Auth */
var SUPABASE_URL = 'https://zstgiptwnqzsvgntsgtz.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdGdpcHR3bnF6c3ZnbnRzZ3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjA1MTcsImV4cCI6MjA5ODQ5NjUxN30.VXQ29HsZdWobZpgfe-sxTjlraePRzeRgRJ0XnKRezOQ';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current user state
var currentUser = null;

// Auth helper functions
var Auth = {
  // Login with email/password
  login: async function(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) return { success: false, message: error.message };
    currentUser = data.user;
    return { success: true, user: data.user };
  },

  // Logout
  logout: async function() {
    await supabase.auth.signOut();
    currentUser = null;
  },

  // Check if logged in
  isLoggedIn: function() {
    return currentUser !== null;
  },

  // Get current user
  getUser: function() {
    return currentUser;
  },

  // Get user ID
  getUserId: function() {
    return currentUser ? currentUser.id : null;
  },

  // Initialize - check existing session
  init: async function() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      currentUser = session.user;
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(function(event, session) {
      if (session) {
        currentUser = session.user;
      } else {
        currentUser = null;
      }
    });
    
    return currentUser;
  }
};

console.log('Supabase + Auth initialized');
