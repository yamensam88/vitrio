import nodemailer from 'nodemailer';

// Helper function to send emails without exposing an HTTP endpoint
export async function sendNotificationEmail(type: string, payload: any) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error('Missing GMAIL_USER or GMAIL_PASS environment variables');
        throw new Error('Server misconfiguration: Missing email credentials');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    let mailOptions: any = {
        from: `"Vitrio Notifications" <${process.env.GMAIL_USER}>`,
    };

    if (type === 'admin_alert_new_partner') {
        mailOptions.to = process.env.GMAIL_USER;
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
        mailOptions.to = payload.partnerEmail;
        mailOptions.bcc = process.env.GMAIL_USER;
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
                <p>Veuillez vous connecter à votre <strong>Espace Partenaire</strong> pour voir les détails complets et gérer ce rendez-vous.</p>
                <a href="https://vitrio.vercel.app/pro/login" style="display: inline-block; background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Accéder à mon Espace Pro</a>
            </div>
        `;
    } else if (type === 'partner_accepted') {
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
                    <p style="margin: 0; color: #166534; font-size: 0.9em; text-transform: uppercase;">Votre Code d'Accès Pro</p>
                    <p style="margin: 10px 0 0 0; font-size: 2.5em; font-weight: 800; color: #16A34A; letter-spacing: 2px;">${payload.code}</p>
                </div>
                <p>Ce code est strictement personnel. Il vous permettra de gérer vos disponibilités et vos rendez-vous.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://vitrio.vercel.app/pro/login" style="background-color: #2563EB; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Accéder à mon Espace Pro
                    </a>
                </div>
            </div>
        `;
    } else if (type === 'client_booking_confirmation') {
        mailOptions.to = payload.clientEmail;
        mailOptions.subject = '✅ Confirmation de votre demande de RDV - Vitrio';
        mailOptions.html = `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #2563EB; text-align: center;">Demande de RDV bien reçue !</h2>
                <p>Bonjour <strong>${payload.clientName}</strong>,</p>
                <p>Nous vous confirmons la bonne prise en compte de votre rendez-vous pour votre <strong>${payload.vehicle}</strong>.</p>
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Garage :</strong> ${payload.garageName}</p>
                    <p style="margin: 5px 0;"><strong>Date :</strong> ${payload.date}</p>
                    <p style="margin: 5px 0;"><strong>Adresse :</strong> ${payload.garageAddress}</p>
                </div>
                <p>Le garage évaluera votre dossier sous 24h.</p>
                <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #6B7280;">L'équipe Vitrio</p>
            </div>
        `;
    } else {
        throw new Error('Invalid email type');
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('[DEBUG] Email sent securely from internal service to:', mailOptions.to);
    return info;
}
