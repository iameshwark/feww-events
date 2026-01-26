import { createClient } from '@supabase/supabase-js';

// 🔴 REPLACE THESE WITH YOUR KEYS FROM THE SUPABASE DASHBOARD
const SUPABASE_URL = 'https://tklhqlzismcdjkpegffb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbGhxbHppc21jZGprcGVnZmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzODI1MjEsImV4cCI6MjA4NDk1ODUyMX0.pw_PopV4dXxj7ekhW9fUn6DURZHs4V4pLSnW9ULiR1E'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);