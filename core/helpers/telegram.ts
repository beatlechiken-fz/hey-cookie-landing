// Envía un mensaje al chat de Telegram del negocio. Nunca lanza: una notificación
// fallida no debe tumbar la operación que la originó.

export async function notificarTelegram(text: string, chatId = process.env.TELEGRAM_CHAT_ID) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => null);
}
