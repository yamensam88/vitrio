// Check exact status strings in DB
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

async function checkStatuses() {
    const { data: appts } = await supabase
        .from('appointments')
        .select('status')
        .not('status', 'is', null);

    const uniqueStatuses = [...new Set(appts.map(a => a.status))];

    console.log('Unique statuses found:');
    uniqueStatuses.forEach(s => {
        console.log(`"${s}" (length: ${s.length})`);
        // Print char codes to be sure about encoding
        const codes = [];
        for (let i = 0; i < s.length; i++) {
            codes.push(s.charCodeAt(i));
        }
        console.log(`   Char codes: ${codes.join(', ')}`);
    });
}

checkStatuses();
