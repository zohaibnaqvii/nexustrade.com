
const BOT_TOKEN = '8445593270:AAGU9MIKykBi6IbgZ4qCQZm3skGcpWUXbEo';
const CHAT_ID = '8245937543';
const PROJECT_ID = 'qtradex-binary';

export const sendTelegramNotification = async (message: string, docId?: string) => {
  let finalMessage = message;
  
  if (docId) {
    // Generates a direct link to the document in Firebase Console
    const adminLink = `https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/~2Ftransactions~2F${docId}`;
    finalMessage += `\n\n🔗 <a href="${adminLink}">OPEN FOR APPROVAL</a>`;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const params = new URLSearchParams();
  params.append('chat_id', CHAT_ID);
  params.append('text', finalMessage);
  params.append('parse_mode', 'HTML');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: params,
    });
    return response.ok;
  } catch (error) {
    console.error('Telegram Error:', error);
    return false;
  }
};