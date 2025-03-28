import { supabase } from './lib/supabaseClient';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Try to query the health_check table
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return false;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Data received:', data);
    return true;
  } catch (err) {
    console.error('Exception when connecting to Supabase:', err);
    return false;
  }
}

// Run the test
testSupabaseConnection();
