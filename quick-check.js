// Simple script to check if tables have data
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split(/\r?\n/);

let supabaseUrl = '';
let supabaseKey = '';

envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim().replace(/['"]/g, '');
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = trimmed.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim().replace(/['"]/g, '');
    }
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCheck() {
    console.log('Quick Database Check\n' + '='.repeat(50));

    // Check admin_garages
    const { data: garages, error: gError, count: gCount } = await supabase
        .from('admin_garages')
        .select('*', { count: 'exact' });

    console.log(`\nAdmin Garages: ${garages?.length || 0} rows`);
    if (gError) console.error('Error:', gError.message);
    if (garages && garages.length > 0) {
        console.log('Sample:', JSON.stringify(garages[0], null, 2));
    }

    // Check appointments
    const { data: appts, error: aError } = await supabase
        .from('appointments')
        .select('*');

    console.log(`\nAppointments: ${appts?.length || 0} rows`);
    if (aError) console.error('Error:', aError.message);
    if (appts && appts.length > 0) {
        console.log('Sample:', JSON.stringify(appts[0], null, 2));
    }

    // Check garages table
    const { data: garagesList, error: glError } = await supabase
        .from('garages')
        .select('*');

    console.log(`\nGarages: ${garagesList?.length || 0} rows`);
    if (glError) console.error('Error:', glError.message);
    if (garagesList && garagesList.length > 0) {
        console.log('Sample:', JSON.stringify(garagesList[0], null, 2));
    }

    console.log('\n' + '='.repeat(50));
}

quickCheck();
