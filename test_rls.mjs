import { createClient } from '@supabase/supabase-js';

// Load from .env.local manually if needed, or rely on the environment
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, { 
    auth: { persistSession: false } 
});

async function testRLS() {
  console.log("Testing Anon Access to admin_garages...");
  const { data, error } = await supabase.from('admin_garages').select('id, name, generated_code').limit(3);
  
  if (error) {
    console.log("RLS Blocks Anon Select:", error.message);
  } else {
    console.log("CRITICAL: Anon can read admin_garages!", data);
  }

  console.log("\nTesting Anon Access to garages...");
  const { data: gData, error: gError } = await supabase.from('garages').select('id, name, access_code').limit(3);
  
  if (gError) {
    console.log("RLS Blocks Anon Select:", gError.message);
  } else {
    console.log("CRITICAL: Anon can read garages!", gData);
  }
}

testRLS();
