const twilio = require('twilio');
const axios = require('axios');

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Send SMS message using configured provider
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number (with country code)
 * @param {string} options.message - SMS message content
 * @returns {Promise} - SMS provider response
 */
const sendSMS = async (options) => {
  // Determine which SMS provider to use
  const smsProvider = process.env.SMS_PROVIDER || 'twilio';
  
  console.log(`Using SMS provider: ${smsProvider}`);
  console.log(`Attempting to send SMS to: ${options.to}`);
  
  try {
    switch (smsProvider.toLowerCase()) {
      case 'twilio':
        return await sendTwilioSMS(options);
      
      case 'vonage':
        return await sendVonageSMS(options);
      
      case 'messagebird':
        return await sendMessageBirdSMS(options);
        
      case 'log':
        // Just log the message for development
        console.log('SMS WOULD BE SENT:', {
          to: options.to,
          message: options.message
        });
        return { status: 'success', provider: 'log' };
        
      default:
        throw new Error(`Unknown SMS provider: ${smsProvider}`);
    }
  } catch (error) {
    console.error(`Error sending SMS via ${smsProvider}:`, error);
    throw error;
  }
};

// Twilio implementation
async function sendTwilioSMS(options) {
  if (!twilioClient) {
    throw new Error('Twilio credentials not configured');
  }
  
  const message = await twilioClient.messages.create({
    body: options.message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: options.to
  });
  
  console.log(`Twilio SMS sent successfully! SID: ${message.sid}`);
  return message;
}

// Vonage implementation (requires npm install @vonage/server-sdk)
async function sendVonageSMS(options) {
  // This is a placeholder - you would need to install and configure Vonage SDK
  throw new Error('Vonage SMS provider not implemented');
}

// MessageBird implementation (requires npm install messagebird)
async function sendMessageBirdSMS(options) {
  // This is a placeholder - you would need to install and configure MessageBird SDK
  throw new Error('MessageBird SMS provider not implemented');
}

module.exports = sendSMS;
