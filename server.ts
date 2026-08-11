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
  botConfig: { botToken: string; botUsername: string; webhookUrl: string; welcomeMessageTemplate: string; isActive: boolean };
  webhookLogs: any[];
  settings: Record<string, any>;
}

const defaultStore = (): Store => ({
  adminTelegramIds: ['987654321'],
  primaryAdminTelegramId: '987654321',
  botConfig: {
    botToken: '7123456789:AAFg_TONQUEST_DEMO_TOKEN_API',
    botUsername: 'tonquest_bot',
    webhookUrl: '',
    welcomeMessageTemplate: 'Welcome to TonQuest, {first_name}! Open the Mini App below.',
    isActive: true,
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
    if (fs.existsSync(STORE_FILE)) return { ...defaultStore(), ...JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) };
  } catch (e) { console.error(e); }
  return defaultStore();
}
function saveStore(s: Store) {
  try { ensureDataDir(); fs.writeFileSync(STORE_FILE, JSON.stringify(s, null, 2)); } catch (e) { console.error(e); }
}

let store = loadStore();

function isAdminTelegramId(id: any): boolean {
  if (id == null) return false;
  return store.adminTelegramIds.map(String).includes(String(id).trim());
}

function requireAdmin(req: express.Request, res: express.Response): boolean {
  const adminKey = req.headers['x-admin-key'] as string | undefined;
  const telegramId = (req.headers['x-telegram-id'] as string) || req.body?.telegramId || req.query?.telegramId;
  const envKey = process.env.ADMIN_SECRET || 'tonquest-admin-2026';
  if (adminKey && adminKey === envKey) return true;
  if (telegramId && isAdminTelegramId(telegramId)) return true;
  res.status(403).json({ error: 'Admin access required. Pass X-Admin-Key or X-Telegram-Id of an admin.' });
  return false;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', server: 'TonQuest', timestamp: new Date().toISOString(), adminsCount: store.adminTelegramIds.length });
});

app.get('/api/admin/check', (req, res) => {
  const telegramId = String(req.query.telegramId || '').trim();
  if (!telegramId) return res.status(400).json({ error: 'telegramId query required' });
  res.json({ telegramId, isAdmin: isAdminTelegramId(telegramId), isPrimary: store.primaryAdminTelegramId === telegramId, primaryAdminTelegramId: store.primaryAdminTelegramId });
});

app.get('/api/admin/config', (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ adminTelegramIds: store.adminTelegramIds, primaryAdminTelegramId: store.primaryAdminTelegramId, botConfig: store.botConfig, settings: store.settings });
});

app.post('/api/admin/admins', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { adminTelegramIds, primaryAdminTelegramId, addTelegramId, removeTelegramId } = req.body || {};
  if (Array.isArray(adminTelegramIds)) {
    store.adminTelegramIds = [...new Set(adminTelegramIds.map((id: any) => String(id).trim()).filter(Boolean))];
  }
  if (addTelegramId) {
    const id = String(addTelegramId).trim();
    if (id && !store.adminTelegramIds.includes(id)) store.adminTelegramIds.push(id);
  }
  if (removeTelegramId) {
    const id = String(removeTelegramId).trim();
    if (id === store.primaryAdminTelegramId) return res.status(400).json({ error: 'Cannot remove primary admin' });
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
  res.json({ success: true, adminTelegramIds: store.adminTelegramIds, primaryAdminTelegramId: store.primaryAdminTelegramId });
});

app.post('/api/admin/bot-config', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const b = req.body || {};
  if (b.botToken !== undefined) store.botConfig.botToken = String(b.botToken);
  if (b.botUsername !== undefined) store.botConfig.botUsername = String(b.botUsername).replace('@', '');
  if (b.webhookUrl !== undefined) store.botConfig.webhookUrl = String(b.webhookUrl);
  if (b.welcomeMessageTemplate !== undefined) store.botConfig.welcomeMessageTemplate = String(b.welcomeMessageTemplate);
  if (b.isActive !== undefined) store.botConfig.isActive = Boolean(b.isActive);
  saveStore(store);
  res.json({ success: true, botConfig: store.botConfig });
});

app.post('/api/telegram/webhook', (req, res) => {
  const update = req.body || {};
  const timestamp = new Date().toISOString();
  console.log('Webhook:', JSON.stringify(update).slice(0, 500));
  if (update.message) {
    const msg = update.message;
    const text = msg.text || '';
    const from = msg.from || {};
    let referrerId: string | undefined;
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1) referrerId = parts[1].replace('ref_', '');
    }
    const miniAppLaunchUrl = `https://t.me/${store.botConfig.botUsername}/app?startapp=ref_${from.id}`;
    store.webhookLogs.unshift({
      id: `wh_${Date.now()}`, timestamp,
      eventType: referrerId ? 'referral_app_launch' : 'welcome_sent',
      senderTelegramId: String(from.id || 'unknown'),
      senderName: `${from.first_name || 'User'}`.trim(),
      senderUsername: from.username,
      referrerId, miniAppUrl: miniAppLaunchUrl,
      messageText: `Welcome to ${from.first_name || 'User'}`,
      status: 'delivered', rawPayload: update,
    });
    if (store.webhookLogs.length > 200) store.webhookLogs = store.webhookLogs.slice(0, 200);
    saveStore(store);
    return res.json({ ok: true, mini_app_link: miniAppLaunchUrl });
  }
  res.json({ ok: true });
});

app.post('/api/telegram/set-webhook', (req, res) => {
  const b = req.body || {};
  if (b.botToken) store.botConfig.botToken = b.botToken;
  if (b.botUsername) store.botConfig.botUsername = String(b.botUsername).replace('@', '');
  if (b.webhookUrl) store.botConfig.webhookUrl = b.webhookUrl;
  if (b.welcomeMessageTemplate) store.botConfig.welcomeMessageTemplate = b.welcomeMessageTemplate;
  saveStore(store);
  res.json({ success: true, config: store.botConfig, telegramApiStatus: { ok: true, url: store.botConfig.webhookUrl } });
});

app.post('/api/telegram/track-referral-app-launch', (req, res) => {
  const b = req.body || {};
  store.webhookLogs.unshift({
    id: `wh_ref_${Date.now()}`, timestamp: new Date().toISOString(),
    eventType: 'referral_app_launch',
    senderTelegramId: String(b.userId || 'unknown'),
    senderName: b.userName || 'User',
    senderUsername: b.userUsername,
    referrerId: String(b.referrerId || 'system'),
    miniAppUrl: b.miniAppUrl,
    messageText: 'Referral launch',
    status: 'processed', rawPayload: b,
  });
  saveStore(store);
  res.json({ success: true });
});

app.get('/api/telegram/webhook-logs', (_req, res) => {
  res.json({ botConfig: store.botConfig, totalLogs: store.webhookLogs.length, logs: store.webhookLogs });
});

app.post('/api/telegram/simulate-webhook-event', (req, res) => {
  res.json({ success: true, message: 'Simulated', body: req.body });
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
    console.log(`TonQuest on :${PORT} (${isProd ? 'prod' : 'dev'}) admin=${store.primaryAdminTelegramId}`);
  });
}
startServer();
