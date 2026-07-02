/* Supabase Client Initialization */
var SUPABASE_URL = 'https://zstgiptwnqzsvgntsgtz.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdGdpcHR3bnF6c3ZnbnRzZ3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjA1MTcsImV4cCI6MjA5ODQ5NjUxN30.VXQ29HsZdWobZpgfe-sxTjlraePRzeRgRJ0XnKRezOQ';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase initialized');
