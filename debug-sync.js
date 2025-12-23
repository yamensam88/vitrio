// Debug script - with better error handling
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
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

console.log('URL loaded:', supabaseUrl);
console.log('URL length:', supabaseUrl.length);
console.log('Key loaded:', supabaseKey ? `Yes (${supabaseKey.length} chars)` : 'No');

if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Missing credentials');
    process.exit(1);
}

// Validate URL
try {
    new URL(supabaseUrl);
} catch (e) {
    console.error('ERROR: Invalid URL format:', e.message);
    console.error('URL value:', JSON.stringify(supabaseUrl));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugData() {
    console.log('\n' + '='.repeat(80));
    console.log('DEBUG: Data Synchronization Check');
    console.log('='.repeat(80));

    try {
        // Get admin garages
        const { data: garages, error: garagesError } = await supabase
            .from('admin_garages')
            .select('*')
            .order('created_at', { ascending: false });

        if (garagesError) {
            console.error('Error fetching garages:', garagesError);
            return;
        }

        // Get appointments
        const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false });

        if (appointmentsError) {
            console.error('Error fetching appointments:', appointmentsError);
            return;
        }

        console.log(`\n📊 ADMIN GARAGES (${garages.length} total):`);
        console.log('-'.repeat(80));
        garages.forEach(g => {
            console.log(`  • ${g.name} (ID: ${g.id})`);
            console.log(`    garage_id: ${g.garage_id || 'NULL'}`);
            console.log(`    status: ${g.status}`);
        });

        console.log(`\n📅 APPOINTMENTS (${appointments.length} total):`);
        console.log('-'.repeat(80));
        appointments.forEach(a => {
            console.log(`  • ${a.client_name} (ID: ${a.id})`);
            console.log(`    garage_id: ${a.garage_id}`);
            console.log(`    status: ${a.status}`);
        });

        console.log(`\n🔗 MATCHING ANALYSIS:`);
        console.log('-'.repeat(80));
        garages.forEach(g => {
            const matches = appointments.filter(a => a.garage_id === g.garage_id);
            const confirmed = matches.filter(a => a.status === 'Confirmé').length;
            const pending = matches.filter(a => a.status === 'En attente').length;

            console.log(`  ${g.name}:`);
            console.log(`    garage_id: ${g.garage_id || 'NULL'}`);
            console.log(`    Appointments: ${matches.length} (Confirmed: ${confirmed}, Pending: ${pending})`);
            console.log(`    Commission: ${confirmed * 55}€`);

            if (matches.length === 0 && g.garage_id) {
                console.log(`    ⚠️  No appointments match this garage_id`);
            }
            if (!g.garage_id) {
                console.log(`    ⚠️  garage_id is NULL`);
            }
            console.log('');
        });

        console.log('\n💡 DIAGNOSIS:');
        console.log('-'.repeat(80));
        const totalMatches = garages.reduce((sum, g) => {
            return sum + appointments.filter(a => a.garage_id === g.garage_id).length;
        }, 0);

        if (totalMatches === 0 && appointments.length > 0) {
            console.log(`  ❌ NO MATCHES! Appointments exist but garage_ids don't align.`);
            console.log(`\n  Appointment garage_ids:`);
            const uniqueGarageIds = [...new Set(appointments.map(a => a.garage_id))];
            uniqueGarageIds.forEach(id => console.log(`    - ${id}`));
            console.log(`\n  Admin garage_ids:`);
            garages.forEach(g => console.log(`    - ${g.garage_id || 'NULL'} (${g.name})`));
        } else {
            console.log(`  ✅ ${totalMatches} appointment(s) matched successfully`);
        }

        console.log('\n' + '='.repeat(80));
    } catch (error) {
        console.error('Error:', error);
    }
}

debugData();
