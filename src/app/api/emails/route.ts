
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { type, payload } = await request.json();

        // Validate Environment Variables
        if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
            console.error('Missing GMAIL_USER or GMAIL_PASS environment variables');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS, // App Password
            },
        });

        let mailOptions: any = {
            from: `"Vitrio Notifications" <${process.env.GMAIL_USER}>`,
        };

        if (type === 'admin_alert_new_partner') {
            // Send to Admin
            mailOptions.to = process.env.GMAIL_USER; // To Admin
            mailOptions.subject = '🚀 Nouvelle Demande de Partenariat - Vitrio';
            mailOptions.html = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563EB;">Nouvelle inscription partenaire !</h2>
                    <p>Un garage vient de demander à rejoindre le réseau.</p>
                    <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Nom :</strong> ${payload.name}</p>
                        <p><strong>Ville :</strong> ${payload.city}</p>
                        <p><strong>Email :</strong> ${payload.email}</p>
                        <p><strong>Téléphone :</strong> ${payload.phone}</p>
                    </div>
                    <p>Connectez-vous au Dashboard Admin pour valider ce partenaire.</p>
                </div>
            `;
        } else if (type === 'partner_alert_new_appointment') {
            // Send to Partner + Admin Copy
            // Lookup partner email from admin_garages using garageId
            const garageIdToLookup = String(payload.garageId).trim();
            console.log(`[DEBUG] Partner email lookup - GarageID: "${garageIdToLookup}" (Type: ${typeof payload.garageId})`);

            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            // Try standard name and common alternative
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

            if (!supabaseServiceKey) {
                console.error('[CRITICAL] SUPABASE_SERVICE_ROLE_KEY is MISSING in Environment Variables!');
                return NextResponse.json({ error: 'Server misconfiguration: Missing Service Key' }, { status: 500 });
            }

            console.log('[DEBUG] Initializing Supabase Admin Client...');
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            console.log('[DEBUG] Querying admin_garages for garage_id:', garageIdToLookup);
            const { data: adminGarage, error: lookupError } = await supabaseAdmin
                .from('admin_garages')
                .select('id, email, garage_id') // Select specific fields to verify
                .eq('garage_id', garageIdToLookup)
                .maybeSingle(); // Use maybeSingle to avoid error on 0 rows, we handle null manually

            console.log('[DEBUG] Lookup result - data:', adminGarage);
            console.log('[DEBUG] Lookup result - error:', lookupError);

            if (lookupError || !adminGarage?.email) {
                console.error('[ERROR] Failed to lookup partner email:', lookupError);
                return NextResponse.json({ error: 'Partner email not found' }, { status: 404 });
            }

            console.log('[DEBUG] Partner email found:', adminGarage.email);
            mailOptions.to = adminGarage.email;
            mailOptions.bcc = process.env.GMAIL_USER; // Admin gets a silent copy
            mailOptions.subject = '📅 Nouveau Rendez-vous Client - Vitrio';
            mailOptions.html = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #16A34A;">Nouveau Rendez-vous Confirmé !</h2>
                    <p>Un client vient de réserver un créneau dans votre garage via Vitrio.</p>
                    
                    <div style="background: #ECFDF5; padding: 15px; border-radius: 8px; border: 1px solid #6EE7B7; margin: 20px 0;">
                        <p><strong>Véhicule :</strong> ${payload.vehicle}</p>
                        <p><strong>Date :</strong> ${payload.date}</p>
                        <p style="color: #666; font-style: italic; margin-top: 10px;">Connectez-vous pour voir les coordonnées du client.</p>
                    </div>

                    <p style="font-weight: bold; font-size: 1.1em;">Action requise :</p>
                    <p>Veuillez vous connecter à votre <strong>Espace Partenaire</strong> pour voir les détails complets (contact client, documents) et gérer ce rendez-vous.</p>
                    
                    <a href="https://vitrio.vercel.app/pro/login" style="display: inline-block; background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Accéder à mon Espace Pro</a>
                </div>
                </div>
            `;
        } else if (type === 'partner_accepted') {
            // Send to Partner (Congratulations + Code)
            mailOptions.to = payload.email;
            mailOptions.subject = '🎉 Félicitations ! Votre compte Vitrio est validé';
            mailOptions.html = `
                <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #2563EB; margin-bottom: 5px;">Bienvenue chez Vitrio !</h1>
                        <p style="color: #666; font-size: 1.1em;">Le réseau de confiance pour le vitrage.</p>
                    </div>

                    <p>Bonjour <strong>${payload.name}</strong>,</p>
                    
                    <p>Nous avons le plaisir de vous informer que votre demande de partenariat a été <strong>acceptée</strong>.</p>
                    
                    <div style="background-color: #F0FDF4; border: 1px solid #DCFCE7; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                        <p style="margin: 0; color: #166534; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.05em;">Votre Code d'Accès Pro</p>
                        <p style="margin: 10px 0 0 0; font-size: 2.5em; font-weight: 800; color: #16A34A; letter-spacing: 2px;">${payload.code}</p>
                    </div>

                    <p>Ce code est strictement personnel. Il vous permettra de vous connecter à votre espace partenaire pour :</p>
                    <ul style="color: #4B5563; line-height: 1.6;">
                        <li>Gérer vos disponibilités en temps réel.</li>
                        <li>Recevoir et confirmer les rendez-vous clients.</li>
                        <li>Suivre vos commissions et facturations.</li>
                    </ul>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://vitrio.vercel.app/pro/login" style="background-color: #2563EB; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Accéder à mon Espace Pro
                        </a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #9CA3AF; font-size: 0.85em; text-align: center;">
                        Si vous avez des questions, notre équipe support est à votre disposition.<br>
                        L'équipe Vitrio
                    </p>
                </div>
            `;
        } else if (type === 'client_booking_confirmation') {
            // Send to Client
            mailOptions.to = payload.clientEmail;
            mailOptions.subject = '✅ Confirmation de votre demande de RDV - Vitrio';
            mailOptions.html = `
                <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #2563EB; text-align: center;">Demande de RDV bien reçue !</h2>
                    
                    <p>Bonjour <strong>${payload.clientName}</strong>,</p>
                    
                    <p>Nous vous confirmons la bonne prise en compte de votre demande de rendez-vous pour votre <strong>${payload.vehicle}</strong>.</p>
                    
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1F2937;">Détails du rendez-vous</h3>
                        <p style="margin: 5px 0;"><strong>Garage :</strong> ${payload.garageName}</p>
                        <p style="margin: 5px 0;"><strong>Date :</strong> ${payload.date}</p>
                        <p style="margin: 5px 0;"><strong>Adresse :</strong> ${payload.garageAddress}</p>
                    </div>

                    <p><strong>🚨 Prochaine étape :</strong></p>
                    <p>Le garage va vérifier votre dossier d'assurance sous 24h. Si des informations complémentaires sont nécessaires, ils vous contacteront directement.</p>

                    <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #6B7280;">Merci de votre confiance,<br>L'équipe Vitrio</p>
                </div>
            `;
        } else if (type === 'test_partner_email') {
            // Admin Test Mode
            console.log('[DEBUG] Test email request for garageId:', payload.garageId);

            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

            if (!supabaseServiceKey) return NextResponse.json({ error: 'Missing Service Key' }, { status: 500 });

            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

            const { data: adminGarage, error } = await supabaseAdmin
                .from('admin_garages')
                .select('email')
                .eq('garage_id', payload.garageId)
                .maybeSingle();

            if (error || !adminGarage?.email) {
                return NextResponse.json({ error: 'Garage/Email not found for ID: ' + payload.garageId }, { status: 404 });
            }

            mailOptions.to = adminGarage.email;
            mailOptions.subject = '🧪 Test Email - Vitrio Integration';
            mailOptions.html = `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #2563EB;">Ceci est un email de test</h2>
                    <p>Si vous recevez ceci, la configuration est correcte !</p>
                    <p><strong>Garage ID:</strong> ${payload.garageId}</p>
                </div>
            `;
        } else {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('[DEBUG] Email sent successfully to:', mailOptions.to);
        return NextResponse.json({ success: true, sentTo: mailOptions.to, messageId: info.messageId });

    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
