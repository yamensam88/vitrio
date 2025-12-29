// Script to dump full data for analysis
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpData() {
    console.log('Fetching data...');

    const { data: garages, error: gError } = await supabase
        .from('admin_garages')
        .select('id, name, garage_id, created_at, generated_code')
        .order('created_at', { ascending: false });

    if (gError) console.error('Error fetching garages:', gError);

    const { data: appointments, error: aError } = await supabase
        .from('appointments')
        .select('id, client_name, garage_id')
        .order('created_at', { ascending: false });

    if (aError) console.error('Error fetching appointments:', aError);

    let output = 'DATA DUMP\n================\n\n';

    output += `ADMIN GARAGES (${garages?.length || 0})\n`;
    output += `ID | Name | Garage ID | Created At | Code\n`;
    output += `---|---|---|---|---\n`;
    garages?.forEach(g => {
        output += `${g.id} | ${g.name} | ${g.garage_id} | ${g.created_at} | ${g.generated_code}\n`;
    });

    output += `\nAPPOINTMENTS (${appointments?.length || 0})\n`;
    output += `ID | Client | Garage ID\n`;
    output += `---|---|---\n`;
    appointments?.forEach(a => {
        output += `${a.id} | ${a.client_name} | ${a.garage_id}\n`;
    });

    // Analyze matches
    output += `\nMATCH ANALYSIS\n`;
    garages?.forEach(g => {
        const count = appointments?.filter(a => a.garage_id === g.garage_id).length || 0;
        if (count > 0) {
            output += `MATCH FOUND: Admin Garage ${g.id} (${g.name}) has ${count} appointments.\n`;
        }
    });

    appointments?.forEach(a => {
        const match = garages?.find(g => g.garage_id === a.garage_id);
        if (!match) {
            output += `ORPHAN APPOINTMENT: ${a.id} (${a.client_name}) linked to garage_id ${a.garage_id} which is NOT in admin_garages.\n`;
        }
    });

    fs.writeFileSync('full_data_dump.txt', output);
    console.log('Data dumped to full_data_dump.txt');
}

dumpData();
