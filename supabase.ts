import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbqyzignlywskpusjuws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicXl6aWdubHl3c2twdXNqdXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODQzNzgsImV4cCI6MjA4MTU2MDM3OH0.uWYUxb4SV0qWKDzwg_jXTpCgwyX-YhTppwhprz7fBzE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);