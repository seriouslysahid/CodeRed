// scripts/test-supabase.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('=== Supabase Direct Test ===');
console.log('URL:', url ? 'SET' : 'MISSING');
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('Using Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');

if (!url || !key) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  try {
    console.log('\n--- Testing Learners Query ---');
    const { data, error } = await supabase
      .from('learners')
      .select('id, name, email, riskScore, riskLabel')
      .limit(5);
    
    if (error) {
      console.error('Learners query error:', error);
    } else {
      console.log('Learners query success:', data);
    }

    console.log('\n--- Testing Nudges Query ---');
    const { data: nudgesData, error: nudgesError } = await supabase
      .from('nudges')
      .select('id, learnerId, text, status, source')
      .limit(5);
    
    if (nudgesError) {
      console.error('Nudges query error:', nudgesError);
    } else {
      console.log('Nudges query success:', nudgesData);
    }

    console.log('\n--- Testing Risk Distribution Query ---');
    const { data: riskData, error: riskError } = await supabase
      .from('learners')
      .select('riskLabel, riskScore');
    
    if (riskError) {
      console.error('Risk distribution query error:', riskError);
    } else {
      console.log('Risk distribution query success:', riskData);
    }

    console.log('\n--- Testing Events Query ---');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('id, learnerId, type, metadata, createdAt')
      .limit(5);
    
    if (eventsError) {
      console.error('Events query error:', eventsError);
    } else {
      console.log('Events query success:', eventsData);
      console.log('Events count:', eventsData?.length || 0);
    }

  } catch (err) {
    console.error('Test failed:', err);
  }
}

run().catch(console.error);