import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
app.use(express.json({ limit: '2mb' }));

interface Store {
  adminTelegramIds: string[];
  primaryAdminTelegramId: string | null;
  botConfig: {
    botToken: string;
    botUsername: string;
    webhookUrl: string;
    welcomeMessageTemplate: string;
    isActive: boolean;
    miniAppUrl: string;
  };
  webhookLogs: any[];
  settings: Record<string, any>;
}

const defaultStore = (): Store => ({
  adminTelegramIds: ['987654321'],
  primaryAdminTelegramId: '987654321',
  botConfig: {
    botToken: process.env.BOT_TOKEN || '',
    botUsername: process.env.BOT_USERNAME || 'tonquest_bot',
    webhookUrl: '',
    welcomeMessageTemplate:
      '⚡ Welcome to TonQuest Mini App, {first_name}! 🚀\n\nComplete daily quests, earn real $TON & USDT rewards, and build your referral network.\n\n👇 Click below to open the Mini App:',
    isActive: true,
    miniAppUrl: process.env.MINI_APP_URL || '',
  },
  webhookLogs: [],
  settings: {},
});

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function loadStore(): Store {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      const base = defaultStore();
      return {
        ...base,
        ...parsed,
        botConfig: { ...base.botConfig, ...(parsed.botConfig || {}) },
      };
    }
  } catch (e) {
    console.error(e);
  }
  return defaultStore();
}
function saveStore(s: Store) {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(s, null, 2));
  } catch (e) {
    console.error(e);
  }
}

let store = loadStore();

function getBotToken(): string {
  return (process.env.BOT_TOKEN || store.botConfig.botToken || '').trim();
}

function getMiniAppUrl(): string {
  const fromEnv = (process.env.MINI_APP_URL || process.env.APP_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (store.botConfig.miniAppUrl) return store.botConfig.miniAppUrl.replace(/\/$/, '');
  return '';
}

function isAdminTelegramId(id: any): boolean {
  if (id == null) return false;
  return store.adminTelegramIds.map(String).includes(String(id).trim());
}

function requireAdmin(req: express.Request, res: express.Response): boolean {
  const adminKey = req.headers['x-admin-key'] as string | undefined;
  const telegramId =
    (req.headers['x-telegram-id'] as string) || req.body?.telegramId || req.query?.telegramId;
  const envKey = process.env.ADMIN_SECRET || 'tonquest-admin-2026';
  if (adminKey && adminKey === envKey) return true;
  if (telegramId && isAdminTelegramId(telegramId)) return true;
  res.status(403).json({ error: 'Admin access required. Pass X-Admin-Key or X-Telegram-Id of an admin.' });
  return false;
}

async function telegramApi(method: string, body: Record<string, any>): Promise<any> {
  const token = getBotToken();
  if (!token || token.includes('DEMO') || token.includes('AAFg_TONQUEST')) {
    console.warn('[Telegram] No real BOT_TOKEN configured. Set BOT_TOKEN env or save token in /admin.');
    return { ok: false, description: 'BOT_TOKEN not configured' };
  }
  const url = `https://api.telegram.org/bot${token}/${method}`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!data.ok) {
      console.error(`[Telegram] ${method} failed:`, data);
    }
    return data;
  } catch (e: any) {
    console.error(`[Telegram] ${method} error:`, e?.message || e);
    return { ok: false, description: String(e?.message || e) };
  }
}

async function sendMessage(
  chatId: number | string,
  text: string,
  extra: Record<string, any> = {}
) {
  return telegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
}

function buildWelcomeKeyboard(userId: number | string) {
  const username = store.botConfig.botUsername || 'tonquest_bot';
  const miniApp = getMiniAppUrl();
  const rows: any[][] = [];
  if (miniApp && miniApp.startsWith('http')) {
    rows.push([{ text: '🚀 Launch Mini App', web_app: { url: miniApp } }]);
  }
  rows.push([
    {
      text: '📱 Open in Telegram',
      url: `https://t.me/${username}/app?startapp=ref_${userId}`,
    },
  ]);
  return { inline_keyboard: rows };
}

function pushLog(entry: any) {
  store.webhookLogs.unshift(entry);
  if (store.webhookLogs.length > 200) store.webhookLogs = store.webhookLogs.slice(0, 200);
  saveStore(store);
}

app.get('/api/health', (_req, res) => {
  const token = getBotToken();
  res.json({
    status: 'ok',
    server: 'TonQuest',
    timestamp: new Date().toISOString(),
    botTokenConfigured: Boolean(token && !token.includes('DEMO')),
    adminsCount: store.adminTelegramIds.length,
  });
});

app.get('/api/admin/check', (req, res) => {
  const telegramId = String(req.query.telegramId || '').trim();
  if (!telegramId) return res.status(400).json({ error: 'telegramId query required' });
  res.json({
    telegramId,
    isAdmin: isAdminTelegramId(telegramId),
    isPrimary: store.primaryAdminTelegramId === telegramId,
    primaryAdminTelegramId: store.primaryAdminTelegramId,
  });
});

app.get('/api/admin/config', (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({
    adminTelegramIds: store.adminTelegramIds,
    primaryAdminTelegramId: store.primaryAdminTelegramId,
    botConfig: store.botConfig,
    settings: store.settings,
  });
});

app.post('/api/admin/admins', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { adminTelegramIds, primaryAdminTelegramId, addTelegramId, removeTelegramId } = req.body || {};
  if (Array.isArray(adminTelegramIds)) {
    store.adminTelegramIds = [
      ...new Set(adminTelegramIds.map((id: any) => String(id).trim()).filter(Boolean)),
    ];
  }
  if (addTelegramId) {
    const id = String(addTelegramId).trim();
    if (id && !store.adminTelegramIds.includes(id)) store.adminTelegramIds.push(id);
  }
  if (removeTelegramId) {
    const id = String(removeTelegramId).trim();
    if (id === store.primaryAdminTelegramId) {
      return res.status(400).json({ error: 'Cannot remove primary admin' });
    }
    store.adminTelegramIds = store.adminTelegramIds.filter((x) => x !== id);
  }
  if (primaryAdminTelegramId) {
    const pid = String(primaryAdminTelegramId).trim();
    if (pid) {
      store.primaryAdminTelegramId = pid;
      if (!store.adminTelegramIds.includes(pid)) store.adminTelegramIds.push(pid);
    }
  }
  if (!store.adminTelegramIds.length) {
    store.adminTelegramIds = ['987654321'];
    store.primaryAdminTelegramId = '987654321';
  }
  saveStore(store);
  res.json({
    success: true,
    adminTelegramIds: store.adminTelegramIds,
    primaryAdminTelegramId: store.primaryAdminTelegramId,
  });
});

app.post('/api/admin/bot-config', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const b = req.body || {};
  if (b.botToken !== undefined) store.botConfig.botToken = String(b.botToken);
  if (b.botUsername !== undefined) store.botConfig.botUsername = String(b.botUsername).replace('@', '');
  if (b.webhookUrl !== undefined) store.botConfig.webhookUrl = String(b.webhookUrl);
  if (b.welcomeMessageTemplate !== undefined)
    store.botConfig.welcomeMessageTemplate = String(b.welcomeMessageTemplate);
  if (b.miniAppUrl !== undefined) store.botConfig.miniAppUrl = String(b.miniAppUrl);
  if (b.isActive !== undefined) store.botConfig.isActive = Boolean(b.isActive);
  saveStore(store);
  res.json({ success: true, botConfig: store.botConfig });
});

app.post('/api/telegram/set-webhook', async (req, res) => {
  const b = req.body || {};
  if (b.botToken) store.botConfig.botToken = b.botToken;
  if (b.botUsername) store.botConfig.botUsername = String(b.botUsername).replace('@', '');
  if (b.welcomeMessageTemplate) store.botConfig.welcomeMessageTemplate = b.welcomeMessageTemplate;
  if (b.miniAppUrl) store.botConfig.miniAppUrl = b.miniAppUrl;

  let webhookUrl = b.webhookUrl || store.botConfig.webhookUrl;
  if (!webhookUrl) {
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    webhookUrl = `${proto}://${host}/api/telegram/webhook`;
  }
  store.botConfig.webhookUrl = webhookUrl;
  saveStore(store);

  const tg = await telegramApi('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });

  pushLog({
    id: `wh_${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: 'bot_setup',
    senderTelegramId: '0000',
    senderName: 'System',
    messageText: `setWebhook → ${webhookUrl} | ok=${tg.ok}`,
    status: tg.ok ? 'delivered' : 'failed',
    rawPayload: tg,
  });

  res.json({
    success: Boolean(tg.ok),
    message: tg.ok
      ? 'Telegram Webhook set successfully!'
      : `Telegram error: ${tg.description || 'failed'}`,
    config: store.botConfig,
    telegramApiStatus: tg,
  });
});

app.post('/api/telegram/webhook', async (req, res) => {
  res.json({ ok: true });

  const update = req.body || {};
  const timestamp = new Date().toISOString();
  console.log('[Webhook] update keys:', Object.keys(update).join(','));

  try {
    if (update.message) {
      const msg = update.message;
      const text: string = msg.text || '';
      const from = msg.from || {};
      const chatId = msg.chat?.id || from.id;
      const firstName = from.first_name || 'User';

      let referrerId: string | undefined;
      const isStart = text.startsWith('/start');
      if (isStart) {
        const parts = text.split(/\s+/);
        if (parts.length > 1) referrerId = parts[1].replace(/^ref_/, '');
      }

      if (isStart || text === '/help' || text === '/app') {
        const welcome = (store.botConfig.welcomeMessageTemplate || 'Welcome {first_name}!')
          .replace(/\{first_name\}/g, firstName)
          .replace(/\{username\}/g, from.username || '');

        const reply = await sendMessage(chatId, welcome, {
          reply_markup: buildWelcomeKeyboard(from.id || chatId),
        });

        pushLog({
          id: `wh_${Date.now()}`,
          timestamp,
          eventType: referrerId ? 'referral_app_launch' : 'welcome_sent',
          senderTelegramId: String(from.id || 'unknown'),
          senderName: firstName,
          senderUsername: from.username,
          referrerId,
          messageText: welcome.slice(0, 200),
          status: reply?.ok ? 'delivered' : 'failed',
          rawPayload: { update, telegram_response: reply },
        });
        console.log('[Webhook] /start reply ok=', reply?.ok, reply?.description || '');
        return;
      }

      if (text.startsWith('/')) {
        await sendMessage(
          chatId,
          '⚡ Commands:\n/start — Open Mini App\n/help — Help\n/app — Launch app'
        );
        return;
      }

      await sendMessage(chatId, '👋 Send /start to open TonQuest Mini App.', {
        reply_markup: buildWelcomeKeyboard(from.id || chatId),
      });
      return;
    }

    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message?.chat?.id || cq.from?.id;
      if (chatId) {
        await telegramApi('answerCallbackQuery', { callback_query_id: cq.id });
        await sendMessage(chatId, '🚀 Use /start to open the Mini App.');
      }
    }
  } catch (err: any) {
    console.error('[Webhook] handler error:', err?.message || err);
  }
});

app.post('/api/telegram/track-referral-app-launch', (req, res) => {
  const b = req.body || {};
  pushLog({
    id: `wh_ref_${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: 'referral_app_launch',
    senderTelegramId: String(b.userId || 'unknown'),
    senderName: b.userName || 'User',
    senderUsername: b.userUsername,
    referrerId: String(b.referrerId || 'system'),
    miniAppUrl: b.miniAppUrl,
    messageText: 'Referral launch',
    status: 'processed',
    rawPayload: b,
  });
  res.json({ success: true });
});

app.get('/api/telegram/webhook-logs', (_req, res) => {
  res.json({
    botConfig: {
      ...store.botConfig,
      botToken: store.botConfig.botToken ? '***' : '',
    },
    totalLogs: store.webhookLogs.length,
    logs: store.webhookLogs,
  });
});

app.post('/api/telegram/simulate-webhook-event', (req, res) => {
  res.json({ success: true, message: 'Simulated', body: req.body });
});

app.get('/api/telegram/webhook-info', async (_req, res) => {
  const info = await telegramApi('getWebhookInfo', {});
  res.json(info);
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.get('/admin', (_req, res) => res.sendFile(path.join(distPath, 'admin.html')));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  app.listen(PORT, '0.0.0.0', () => {
    const tokenOk = Boolean(getBotToken() && !getBotToken().includes('DEMO'));
    console.log(`TonQuest on :${PORT} (${isProd ? 'prod' : 'dev'})`);
    console.log(`BOT_TOKEN configured: ${tokenOk}`);
    console.log(`Webhook endpoint: /api/telegram/webhook`);
  });
}
startServer();
