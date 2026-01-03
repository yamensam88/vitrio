
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
            mailOptions.to = payload.garageEmail;
            mailOptions.bcc = process.env.GMAIL_USER; // Admin gets a silent copy
            mailOptions.subject = '📅 Nouveau Rendez-vous Client - Vitrio';
            mailOptions.html = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #16A34A;">Nouveau Rendez-vous Confirmé !</h2>
                    <p>Un client vient de réserver un créneau dans votre garage via Vitrio.</p>
                    
                    <div style="background: #ECFDF5; padding: 15px; border-radius: 8px; border: 1px solid #6EE7B7; margin: 20px 0;">
                        <p><strong>Client :</strong> ${payload.clientName}</p>
                        <p><strong>Véhicule :</strong> ${payload.vehicle}</p>
                        <p><strong>Date :</strong> ${payload.date}</p>
                    </div>

                    <p style="font-weight: bold; font-size: 1.1em;">Action requise :</p>
                    <p>Veuillez vous connecter à votre <strong>Espace Partenaire</strong> pour voir les détails complets (contact client, documents) et gérer ce rendez-vous.</p>
                    
                    <a href="https://vitrio.vercel.app/pro/login" style="display: inline-block; background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Accéder à mon Espace Pro</a>
                </div>
            `;
        } else {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
