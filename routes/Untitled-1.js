require('dotenv').config({ path: __dirname + '/../config.env' });
const sendSms = require('../utils/sendSms');

console.log('SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TOKEN:', process.env.TWILIO_AUTH_TOKEN);
console.log('FROM:', process.env.TWILIO_PHONE_NUMBER);

sendSms('+201228747582', 'Test SMS from Twilio').then(console.log).catch(console.error);