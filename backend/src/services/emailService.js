const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Increase timeout for slow mail servers
        connectionTimeout: 10000, 
    };

    // Use Gmail service if configured
    if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
        delete transporterConfig.host;
        delete transporterConfig.port;
        delete transporterConfig.secure;
        transporterConfig.service = 'gmail';
        console.log(`[EMAIL] Using Gmail Service Preset for: ${options.email}`);
    } else {
        console.log(`[EMAIL] Using Manual SMTP (${process.env.EMAIL_HOST}) for: ${options.email}`);
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const message = {
        from: `${process.env.EMAIL_FROM_NAME || 'HRMS'} <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    if (options.attachments) {
        message.attachments = options.attachments;
    }

    const info = await transporter.sendMail(message);

    console.log('[EMAIL] Message sent successfully! ID: %s', info.messageId);
};

module.exports = sendEmail;
