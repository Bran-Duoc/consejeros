
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://traweqraelgoinlrcmja.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYXdlcXJhZWxnb2lubHJjbWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTUzNzUsImV4cCI6MjA5MjczMTM3NX0.vp85YtwPY7OeML4GXxmyTeVMWZHF9WN1LrwKBRUKTQc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Querying tickets...");
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error("Error querying tickets:", error);
  } else {
    console.log("Success! Data:", data);
  }

  console.log("\nQuerying tickets with order...");
  const { data: data2, error: error2 } = await supabase
    .from('tickets')
    .select('*')
    .order('fecha_creacion', { ascending: false })
    .limit(1);

  if (error2) {
    console.error("Error ordering tickets:", error2);
  } else {
    console.log("Success! Data with order:", data2);
  }
}

test();
