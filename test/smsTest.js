require('dotenv').config({ path: __dirname + '/../config.env' });
const sendSms = require('../utils/sendSms');

console.log('SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Loaded' : 'Missing');
console.log('FROM:', process.env.TWILIO_PHONE_NUMBER);

sendSms('+201228747582', 'Test SMS from Twilio')
    .then(response => {
        console.log('SMS sent successfully:', response.sid);
    })
    .catch(error => {
        console.error('SMS sending failed:', error.message);
    });