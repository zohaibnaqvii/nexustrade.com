const TELEGRAM_BOT_TOKEN = '8445593270:AAGU9MIKykBi6IbgZ4qCQZm3skGcpWUXbEo';
const TELEGRAM_CHAT_ID = '8245937543';

// Firebase console URL for admin
const FIREBASE_CONSOLE_URL = 'https://console.firebase.google.com/project/qtradex-binary/firestore/data/~2Ftransactions';
const FIREBASE_KYC_URL = 'https://console.firebase.google.com/project/qtradex-binary/firestore/data/~2Fkyc';

interface TelegramMessage {
  type: 'deposit' | 'withdrawal' | 'kyc';
  userEmail: string;
  amount?: number;
  method?: string;
  transactionId: string;
  promoCode?: string;
  bonusAmount?: number;
}

// Escape special characters for Telegram MarkdownV2
const escapeMarkdown = (text: string): string => {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
};

export const sendTelegramNotification = async (data: TelegramMessage): Promise<boolean> => {
  let message = '';
  let inlineKeyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> = [];

  const safeEmail = escapeMarkdown(data.userEmail);
  const safeId = escapeMarkdown(data.transactionId);
  const safeMethod = data.method ? escapeMarkdown(data.method) : '';

  const safePromoCode = data.promoCode ? escapeMarkdown(data.promoCode) : '';
  const bonusInfo = data.promoCode && data.bonusAmount 
    ? `\n🎁 Promo: ${safePromoCode} \\(\\+\\$${data.bonusAmount.toFixed(2)} bonus\\)` 
    : '';

  switch (data.type) {
    case 'deposit':
      message = `💰 *NEW DEPOSIT REQUEST*\n\n` +
        `📧 User: ${safeEmail}\n` +
        `💵 Amount: *\\$${data.amount}*${bonusInfo}\n` +
        `🔗 Method: ${safeMethod}\n` +
        `🆔 ID: \`${safeId}\`\n\n` +
        `👉 *For confirmation, open Firebase Console below*`;
      inlineKeyboard = [
        [
          { text: '✅ Approve', callback_data: `approve_deposit_${data.transactionId}` },
          { text: '❌ Reject', callback_data: `reject_deposit_${data.transactionId}` }
        ],
        [
          { text: '🔗 Open Firebase Console', url: FIREBASE_CONSOLE_URL }
        ]
      ];
      break;
    case 'withdrawal':
      message = `📤 *NEW WITHDRAWAL REQUEST*\n\n` +
        `📧 User: ${safeEmail}\n` +
        `💵 Amount: *\\$${data.amount}*\n` +
        `🔗 Method: ${safeMethod}\n` +
        `🆔 ID: \`${safeId}\`\n\n` +
        `👉 *For confirmation, open Firebase Console below*`;
      inlineKeyboard = [
        [
          { text: '✅ Approve', callback_data: `approve_withdrawal_${data.transactionId}` },
          { text: '❌ Reject', callback_data: `reject_withdrawal_${data.transactionId}` }
        ],
        [
          { text: '🔗 Open Firebase Console', url: FIREBASE_CONSOLE_URL }
        ]
      ];
      break;
    case 'kyc':
      message = `📋 *NEW KYC SUBMISSION*\n\n` +
        `📧 User: ${safeEmail}\n` +
        `🆔 ID: \`${safeId}\`\n\n` +
        `⏰ *Auto\\-approves in 3 minutes*\n` +
        `👉 *For manual action, open Firebase Console below*`;
      inlineKeyboard = [
        [
          { text: '✅ Approve Now', callback_data: `approve_kyc_${data.transactionId}` },
          { text: '❌ Reject', callback_data: `reject_kyc_${data.transactionId}` }
        ],
        [
          { text: '🔗 Open Firebase Console', url: FIREBASE_KYC_URL }
        ]
      ];
      break;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'MarkdownV2',
        reply_markup: { inline_keyboard: inlineKeyboard }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API error:', errorText);
      
      // Fallback: Try sending without formatting
      const fallbackResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `${data.type.toUpperCase()} REQUEST\n\nUser: ${data.userEmail}\nAmount: $${data.amount || 'N/A'}\nMethod: ${data.method || 'N/A'}\nID: ${data.transactionId}\n\nOpen Firebase to approve/reject.`,
          reply_markup: { inline_keyboard: inlineKeyboard }
        })
      });
      return fallbackResponse.ok;
    }

    return response.ok;
  } catch (error) {
    console.error('Telegram notification failed:', error);
    return false;
  }
};
