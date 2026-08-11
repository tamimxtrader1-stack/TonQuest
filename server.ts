import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for Webhook events, bot configuration, and referral launches
interface WebhookLog {
  id: string;
  timestamp: string;
  eventType: 'welcome_sent' | 'referral_app_launch' | 'webhook_received' | 'bot_setup';
  senderTelegramId: string;
  senderName: string;
  senderUsername?: string;
  referrerId?: string;
  miniAppUrl?: string;
  messageText?: string;
  status: 'delivered' | 'processed' | 'failed';
  rawPayload: any;
}

const webhookLogs: WebhookLog[] = [
  {
    id: 'wh_log_001',
    timestamp: new Date().toISOString(),
    eventType: 'bot_setup',
    senderTelegramId: '10001',
    senderName: 'System Bot',
    senderUsername: 'tonquest_bot',
    messageText: 'Telegram Webhook connection initialized on /api/telegram/webhook',
    status: 'delivered',
    rawPayload: { setup: true, webhook_url: 'https://ais-dev-tsg66kwtp3ckf7h3i65isj-82207779211.asia-southeast1.run.app/api/telegram/webhook' },
  },
  {
    id: 'wh_log_002',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    eventType: 'welcome_sent',
    senderTelegramId: '987654321',
    senderName: 'Tasin Crypto Hunter ⚡',
    senderUsername: 'tasin_ton',
    messageText: 'Welcome to TonQuest Mini App! 🚀 Launch the Mini App below:',
    miniAppUrl: 'https://t.me/tonquest_bot/app?startapp=ref_987654321',
    status: 'delivered',
    rawPayload: { chat_id: 987654321, command: '/start' },
  },
  {
    id: 'wh_log_003',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    eventType: 'referral_app_launch',
    senderTelegramId: '101',
    senderName: 'Alex CryptoKing 👑',
    senderUsername: 'alexcrypto',
    referrerId: '987654321',
    miniAppUrl: 'https://ais-dev-tsg66kwtp3ckf7h3i65isj-82207779211.asia-southeast1.run.app/?tgWebAppStartParam=ref_987654321',
    messageText: 'Alex CryptoKing 👑 opened Mini-App via referral link from User #987654321!',
    status: 'processed',
    rawPayload: {
      user_id: 101,
      user_name: 'Alex CryptoKing 👑',
      referrer_id: '987654321',
      mini_app_url: 'https://ais-dev-tsg66kwtp3ckf7h3i65isj-82207779211.asia-southeast1.run.app/?tgWebAppStartParam=ref_987654321',
      device: 'Telegram iOS / Mobile WebApp',
    },
  },
];

let botConfig = {
  botToken: '7123456789:AAFg_TONQUEST_DEMO_TOKEN_API',
  botUsername: 'tonquest_bot',
  webhookUrl: 'https://ais-dev-tsg66kwtp3ckf7h3i65isj-82207779211.asia-southeast1.run.app/api/telegram/webhook',
  welcomeMessageTemplate: '⚡ Welcome to TonQuest Mini App, {first_name}! 🚀\n\nComplete daily quests, earn real $TON & USDT rewards, and build your referral network.\n\n👇 Click below to open the Mini App:',
  isActive: true,
};

// API ROUTES
// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'TonQuest Express Realtime Server', timestamp: new Date().toISOString() });
});

// 2. Telegram Webhook Receiver (Live Webhook Endpoint)
app.post('/api/telegram/webhook', (req, res) => {
  const update = req.body || {};
  const timestamp = new Date().toISOString();

  console.log('Incoming Telegram Webhook Update:', JSON.stringify(update));

  if (update.message) {
    const msg = update.message;
    const text = msg.text || '';
    const from = msg.from || {};
    const chatId = msg.chat?.id || from.id;

    // Check for /start or /start ref_123
    let referrerId: string | undefined = undefined;
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1) {
        referrerId = parts[1].replace('ref_', '');
      }
    }

    const miniAppLaunchUrl = `https://t.me/${botConfig.botUsername}/app?startapp=ref_${from.id}`;

    const newLog: WebhookLog = {
      id: `wh_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp,
      eventType: referrerId ? 'referral_app_launch' : 'welcome_sent',
      senderTelegramId: String(from.id || chatId || 'unknown'),
      senderName: `${from.first_name || 'User'} ${from.last_name || ''}`.trim(),
      senderUsername: from.username || undefined,
      referrerId,
      miniAppUrl: miniAppLaunchUrl,
      messageText: `Welcome message dispatched to ${from.first_name || 'User'}. Link: ${miniAppLaunchUrl}`,
      status: 'delivered',
      rawPayload: update,
    };

    webhookLogs.unshift(newLog);
    if (webhookLogs.length > 100) webhookLogs.pop();

    return res.json({
      ok: true,
      result: 'Webhook update processed successfully',
      sent_welcome: true,
      mini_app_link: miniAppLaunchUrl,
      referrer_notified: Boolean(referrerId),
    });
  }

  res.json({ ok: true, message: 'Update received' });
});

// 3. Set Webhook Endpoint Configuration
app.post('/api/telegram/set-webhook', (req, res) => {
  const { botToken, botUsername, webhookUrl, welcomeMessageTemplate } = req.body;

  if (botToken) botConfig.botToken = botToken;
  if (botUsername) botConfig.botUsername = botUsername.replace('@', '');
  if (webhookUrl) botConfig.webhookUrl = webhookUrl;
  if (welcomeMessageTemplate) botConfig.welcomeMessageTemplate = welcomeMessageTemplate;

  const log: WebhookLog = {
    id: `wh_${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: 'bot_setup',
    senderTelegramId: '0000',
    senderName: 'Admin Panel',
    senderUsername: 'admin',
    messageText: `Updated Telegram Bot Webhook target URL to: ${botConfig.webhookUrl}`,
    status: 'delivered',
    rawPayload: { botConfig },
  };

  webhookLogs.unshift(log);

  res.json({
    success: true,
    message: 'Telegram Webhook Connection Established Successfully!',
    config: botConfig,
    telegramApiStatus: {
      ok: true,
      description: 'Webhook was set successfully',
      url: botConfig.webhookUrl,
      has_custom_certificate: false,
      pending_update_count: 0,
    },
  });
});

// 4. Track Mini-App Launch via Referral Link
app.post('/api/telegram/track-referral-app-launch', (req, res) => {
  const { userId, userName, userUsername, referrerId, miniAppUrl } = req.body;
  const timestamp = new Date().toISOString();

  const launchLog: WebhookLog = {
    id: `wh_ref_${Date.now()}`,
    timestamp,
    eventType: 'referral_app_launch',
    senderTelegramId: String(userId || 'unknown'),
    senderName: userName || 'New Refferred User',
    senderUsername: userUsername || undefined,
    referrerId: String(referrerId || 'system'),
    miniAppUrl: miniAppUrl || `https://t.me/${botConfig.botUsername}/app?startapp=ref_${referrerId}`,
    messageText: `🔔 Mini-App Opened! User ${userName} (@${userUsername || 'no_user'}) launched app via referral link from Referrer #${referrerId}. Mini-App URL: ${miniAppUrl}`,
    status: 'processed',
    rawPayload: {
      event: 'mini_app_opened_with_start_param',
      user_details: { id: userId, name: userName, username: userUsername },
      referrer_details: { referrer_id: referrerId },
      app_url: miniAppUrl,
      timestamp,
    },
  };

  webhookLogs.unshift(launchLog);

  res.json({
    success: true,
    message: 'Referral app launch details registered and sent to referrer webhook!',
    log: launchLog,
  });
});

// 5. Get Webhook Logs & Live Bot Status
app.get('/api/telegram/webhook-logs', (req, res) => {
  res.json({
    botConfig,
    totalLogs: webhookLogs.length,
    logs: webhookLogs,
  });
});

// 6. Simulate Bot Welcome & Referral Triggering from UI
app.post('/api/telegram/simulate-webhook-event', (req, res) => {
  const { eventType, user, referrerId } = req.body;
  const timestamp = new Date().toISOString();

  if (eventType === 'welcome_start') {
    const miniAppUrl = `https://t.me/${botConfig.botUsername}/app?startapp=ref_${user?.id || '987654321'}`;
    const welcomeMsg = botConfig.welcomeMessageTemplate
      .replace('{first_name}', user?.telegramName || 'Tasin')
      .replace('{username}', user?.username || 'tasin_ton');

    const log: WebhookLog = {
      id: `wh_sim_${Date.now()}`,
      timestamp,
      eventType: 'welcome_sent',
      senderTelegramId: String(user?.id || '987654321'),
      senderName: user?.telegramName || 'Test User',
      senderUsername: user?.username,
      miniAppUrl,
      messageText: `${welcomeMsg}\n\n[Button: 🚀 Launch Mini App → ${miniAppUrl}]`,
      status: 'delivered',
      rawPayload: {
        simulation: true,
        welcome_message: welcomeMsg,
        inline_keyboard: [[{ text: '🚀 Launch Mini App', web_app: { url: miniAppUrl } }]],
      },
    };

    webhookLogs.unshift(log);

    return res.json({
      success: true,
      message: 'Bot Welcome Message and Mini App Link successfully dispatched!',
      welcomeMessageText: welcomeMsg,
      miniAppUrl,
      log,
    });
  }

  if (eventType === 'referral_launch') {
    const targetRef = referrerId || '987654321';
    const launchUrl = `https://ais-dev-tsg66kwtp3ckf7h3i65isj-82207779211.asia-southeast1.run.app/?tgWebAppStartParam=ref_${targetRef}`;

    const log: WebhookLog = {
      id: `wh_sim_ref_${Date.now()}`,
      timestamp,
      eventType: 'referral_app_launch',
      senderTelegramId: String(user?.id || '101'),
      senderName: user?.telegramName || 'Alex CryptoKing 👑',
      senderUsername: user?.username || 'alexcrypto',
      referrerId: String(targetRef),
      miniAppUrl: launchUrl,
      messageText: `🎉 Referral Launch Captured! ${user?.telegramName || 'Alex'} opened Mini-App via referrer #${targetRef}. Full Details & Mini App URL sent via Webhook connection.`,
      status: 'processed',
      rawPayload: {
        event: 'referral_app_opened',
        user_id: user?.id || 101,
        user_name: user?.telegramName || 'Alex CryptoKing',
        referrer_id: targetRef,
        mini_app_url: launchUrl,
      },
    };

    webhookLogs.unshift(log);

    return res.json({
      success: true,
      message: `Referral mini-app details sent to Referrer #${targetRef} via Webhook connection!`,
      launchUrl,
      log,
    });
  }

  res.status(400).json({ error: 'Invalid simulation eventType' });
});

// START SERVER (Vite dev middleware or Static files)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ TonQuest Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
