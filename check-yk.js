// Targeted diagnostic for 'yk' partner and confirmed appointments
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split(/\r?\n/);
let supabaseUrl = '', supabaseKey = '';
envLines.forEach(line => {
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim().replace(/['"]/g, '');
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkYk() {
    console.log('--- DIAGNOSTIC FOR PARTNER "yk" ---\n');

    // 1. Find "yk" in admin_garages
    const { data: adminGarages } = await supabase
        .from('admin_garages')
        .select('*')
        .ilike('name', '%yk%');

    console.log(`Found ${adminGarages.length} admin_garage(s) matching "yk":`);
    adminGarages.forEach(ag => {
        console.log(`- ID: ${ag.id}`);
        console.log(`  Name: ${ag.name}`);
        console.log(`  Garage ID: ${ag.garage_id}`);
        console.log(`  created_at: ${ag.created_at}`);
    });

    if (adminGarages.length === 0) {
        console.log('❌ No admin garage found for "yk"');
        return;
    }

    const targetGarageId = adminGarages[0].garage_id;

    // 2. Find appointments for this garage_id
    const { data: appts } = await supabase
        .from('appointments')
        .select('*')
        .eq('garage_id', targetGarageId);

    console.log(`\nFound ${appts.length} appointment(s) for garage_id "${targetGarageId}":`);
    appts.forEach(a => {
        console.log(`- ID: ${a.id}, Status: "${a.status}", Client: ${a.client_name}`);
    });

    // 3. Check for appointments that MIGHT belong to yk but have wrong garage_id
    // (Assuming we can find them just by listing all appts if there are few, or filtering)
    const { data: allAppts } = await supabase.from('appointments').select('*');
    console.log(`\nTotal appointments in DB: ${allAppts.length}`);
    allAppts.forEach(a => {
        if (a.garage_id !== targetGarageId) {
            console.log(`- [MISMATCH?] ID: ${a.id}, garage_id: ${a.garage_id}, Status: ${a.status}`);
        }
    });
}

checkYk();
