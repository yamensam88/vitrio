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

async function checkAdmins() {
    const { data: admins, error } = await supabase.from('admin_users').select('*');
    if (error) {
        console.error("Error fetching admins:", error);
    } else {
        console.log("Les comptes administrateurs enregistrés sont :");
        console.log(admins.map(a => `- ${a.email} (Nom: ${a.full_name || 'Non défini'})`).join("\n"));
        if (admins.length === 0) console.log("Aucun compte administrateur trouvé.");
    }
}

checkAdmins();
