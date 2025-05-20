# Email Setup Guide

This guide explains how to set up email functionality in your application.

## Development Options

You have several options for handling emails during development:

1. **Log emails instead of sending them** (default)
   - Set `ENABLE_EMAILS_IN_DEV=false` in your .env file
   - The application will log email details to the console

2. **Use Ethereal Email** (fake SMTP service)
   - Set `USE_ETHEREAL=true` in your .env file
   - The application will create a temporary email account and show you preview links

3. **Use real email service**
   - Set `ENABLE_EMAILS_IN_DEV=true` in your .env file
   - Configure your email credentials as described below

## Gmail Setup

If you're using Gmail, you need to set up an App Password:

1. **Enable 2-Step Verification**
   - Go to your Google Account: https://myaccount.google.com/
   - Select "Security" from the left navigation panel
   - Under "Signing in to Google," select "2-Step Verification"
   - Follow the steps to turn on 2-Step Verification

2. **Create an App Password**
   - Go to your Google Account: https://myaccount.google.com/
   - Select "Security" from the left navigation panel
   - Under "Signing in to Google," select "App passwords" 
   - At the bottom, click "Select app" and choose "Mail"
   - Click "Select device" and choose "Other (Custom name)"
   - Enter a name for your app (e.g., "My Node App")
   - Click "Generate"
   - Google will display a 16-character password. **Copy this password**

3. **Update Your Environment Variables**
   - Create a copy of `.env.example` named `.env`
   - Update the email settings with your Gmail address and the App Password

## Other Email Services

You can use other email services by updating the transporter configuration in `utils/sendEmail.js`.

### SendGrid
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Mailgun
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USERNAME,
    pass: process.env.MAILGUN_PASSWORD
  }
});
```

## Troubleshooting

If you encounter issues with email sending:

1. Check your email credentials
2. Ensure your email provider allows SMTP access
3. For Gmail, verify that you're using an App Password, not your regular password
4. Check if your email provider has sending limits or restrictions
5. Look for detailed error messages in the console logs