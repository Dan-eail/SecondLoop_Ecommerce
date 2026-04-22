const axios = require('axios');

const isDev = process.env.NODE_ENV === 'development';

const sendSMS = async (phoneNumber, message) => {
  const apiKey = process.env.SMS_API_KEY;
  const apiUrl = process.env.SMS_API_URL || 'https://api.africastalking.com/version1/messaging';
  const username = process.env.SMS_USERNAME || (isDev ? 'sandbox' : '');
  const senderId = process.env.SMS_SENDER_ID || 'TENA';

  if (!apiKey) {
    if (isDev) {
      console.log(`[SMS:DEV_FALLBACK] To: ${phoneNumber} | Message: ${message}`);
      return { sent: false, fallback: true };
    }
    throw new Error('SMS_API_KEY is missing. Cannot send SMS in production.');
  }

  try {
    if (apiUrl.includes('africastalking.com')) {
      const payload = new URLSearchParams({
        username,
        to: phoneNumber,
        message,
        from: senderId,
      });

      await axios.post(apiUrl, payload.toString(), {
        headers: {
          apiKey,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });
    } else {
      await axios.post(
        apiUrl,
        {
          to: phoneNumber,
          message,
          from: senderId,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
    }

    return { sent: true };
  } catch (error) {
    const status = error.response?.status;
    const providerMessage = error.response?.data?.message || error.message;

    if (isDev) {
      console.error(`[SMS:PROVIDER_ERROR] ${status || 'NO_STATUS'} ${providerMessage}`);
      console.log(`[SMS:DEV_FALLBACK] To: ${phoneNumber} | Message: ${message}`);
      return { sent: false, fallback: true, error: providerMessage };
    }

    throw new Error(`SMS provider request failed: ${providerMessage}`);
  }
};

module.exports = { sendSMS };
