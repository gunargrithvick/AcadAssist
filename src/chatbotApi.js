import axios from 'axios';

// Default Rasa REST webhook URL. Change if using middleware.
const RASA_URL = process.env.REACT_APP_RASA_URL || 'http://localhost:5005/webhooks/rest/webhook';

export async function sendMessage(message, sender='user') {
  try {
    const res = await axios.post(RASA_URL, { sender, message });
    // Rasa returns an array of messages
    return res.data;
  } catch (err) {
    console.error('chatbotApi error', err?.message || err);
    return [{ text: '⚠️ Sorry, chatbot unavailable.' }];
  }
}
