const Contact = require('../models/contactUsModel');
const nodemailer = require('nodemailer');

exports.sendEmail = async (req, res) => {
    try {
        // Get data from request body
        const { name, email, phone, message } = req.body;

        // Save contact to DB
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();

        // Setup mail transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Clean, modern HTML email template
        const mailOptions = {
            from: `"${name}" <${email}>`, // shows user's name/email as sender
            to: process.env.ADMIN_EMAIL,
            subject: `New Contact Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #eee; border-radius:8px; padding:24px; background:#fafbfc;">
                    <h2 style="color:#333; border-bottom:1px solid #eee; padding-bottom:8px;">Contact Form Submission</h2>
                    <table style="width:100%; margin-top:16px;">
                        <tr>
                            <td style="font-weight:bold; width:120px;">Name:</td>
                            <td>${name}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold;">Email:</td>
                            <td>${email}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold;">Phone:</td>
                            <td>${phone || 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold; vertical-align:top;">Message:</td>
                            <td style="white-space:pre-line;">${message}</td>
                        </tr>
                    </table>
                    <div style="margin-top:24px; font-size:12px; color:#888;">
                        Received at: ${new Date().toLocaleString()}
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
};