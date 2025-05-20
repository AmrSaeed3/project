/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber - The phone number to format
 * @param {string} defaultCountryCode - Default country code to use if not provided (e.g., '20' for Egypt)
 * @returns {string} - Formatted phone number in E.164 format
 */
const formatToE164 = (phoneNumber, defaultCountryCode = '20') => {
  // Remove all non-digit characters except the plus sign
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If the number doesn't start with +, add it
  if (!cleaned.startsWith('+')) {
    // If the number starts with the country code without +, add the +
    if (cleaned.startsWith(defaultCountryCode)) {
      cleaned = '+' + cleaned;
    } else {
      // Otherwise, add the + and default country code
      cleaned = '+' + defaultCountryCode + cleaned;
    }
  }
  
  return cleaned;
};

/**
 * Validate if a phone number is in E.164 format
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid E.164 format, false otherwise
 */
const isValidE164 = (phoneNumber) => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};

module.exports = {
  formatToE164,
  isValidE164
};