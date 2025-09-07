// scripts/test-api-debug.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

console.log('=== API Debug Test ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  console.error('Missing SUPABASE_URL');
  process.exit(1);
}

async function testKeys() {
  // Test with service role key first
  if (serviceKey && serviceKey !== 'your_supabase_service_role_key') {
    console.log('\n--- Testing with Service Role Key ---');
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    try {
      const { data, error } = await supabase.from('learners').select('id, name').limit(1);
      if (error) {
        console.error('Service role error:', error);
      } else {
        console.log('Service role success:', data);
      }
    } catch (err) {
      console.error('Service role exception:', err);
    }
  }

  // Test with anon key
  if (anonKey) {
    console.log('\n--- Testing with Anon Key ---');
    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    try {
      const { data, error } = await supabase.from('learners').select('id, name').limit(1);
      if (error) {
        console.error('Anon key error:', error);
      } else {
        console.log('Anon key success:', data);
      }
    } catch (err) {
      console.error('Anon key exception:', err);
    }
  }
}

testKeys().catch(console.error);
