
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load env vars manually from .env.local
try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valParts] = line.split('=');
        if (key && valParts.length > 0) {
            const val = valParts.join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
            process.env[key.trim()] = val;
        }
    });
} catch (e) {
    console.error("Could not read .env.local");
}

async function sendTestEmail() {
    console.log("Testing Email configuration...");
    console.log("User:", process.env.GMAIL_USER);
    // Don't log password

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error("❌ Missing GMAIL_USER or GMAIL_PASS in .env.local");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to self
            subject: 'Test Vitrio Email',
            text: 'It works! Credentials are good.',
        });
        console.log("✅ Email sent successfully via Nodemailer!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

sendTestEmail();
