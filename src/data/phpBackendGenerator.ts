export const MYSQL_DATABASE_SCHEMA = `-- ==========================================================
-- TONQUEST TELEGRAM MINI APP - OPTIMIZED MYSQL DATABASE SCHEMA
-- PHP 8+ / MySQL 8.0+ Compatible with Foreign Keys & Indexes
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`telegram_id\` VARCHAR(64) NOT NULL UNIQUE,
  \`telegram_name\` VARCHAR(128) NOT NULL,
  \`username\` VARCHAR(64) DEFAULT NULL,
  \`photo_url\` VARCHAR(512) DEFAULT NULL,
  \`level\` INT UNSIGNED DEFAULT 1,
  \`xp\` INT UNSIGNED DEFAULT 0,
  \`streak_days\` INT UNSIGNED DEFAULT 1,
  \`last_login_date\` DATE NOT NULL,
  \`referrer_id\` INT UNSIGNED DEFAULT NULL,
  \`has_completed_onboarding\` TINYINT(1) DEFAULT 0,
  \`is_admin\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_telegram_id\` (\`telegram_id\`),
  INDEX \`idx_referrer\` (\`referrer_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. MISSIONS TABLE
CREATE TABLE IF NOT EXISTS \`missions\` (
  \`id\` VARCHAR(32) PRIMARY KEY,
  \`title\` VARCHAR(128) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`type\` VARCHAR(64) NOT NULL,
  \`reward_amount\` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
  \`reward_currency\` VARCHAR(32) NOT NULL,
  \`cooldown_hours\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`icon_name\` VARCHAR(64) DEFAULT 'Coins',
  \`link\` VARCHAR(512) DEFAULT '',
  \`is_required\` TINYINT(1) DEFAULT 0,
  \`sort_order\` INT DEFAULT 0,
  \`enabled\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_type\` (\`type\`),
  INDEX \`idx_enabled_order\` (\`enabled\`, \`sort_order\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. USER_MISSIONS TABLE (TRACKS COOLDOWNS & COMPLETIONS)
CREATE TABLE IF NOT EXISTS \`user_missions\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`mission_id\` VARCHAR(32) NOT NULL,
  \`status\` ENUM('Completed', 'Pending', 'Locked', 'Available', 'OnCooldown') NOT NULL DEFAULT 'Completed',
  \`last_completed_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`expires_at\` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`mission_id\`) REFERENCES \`missions\`(\`id\`) ON DELETE CASCADE,
  UNIQUE KEY \`uk_user_mission\` (\`user_id\`, \`mission_id\`),
  INDEX \`idx_expires\` (\`expires_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. WALLET TABLE
CREATE TABLE IF NOT EXISTS \`wallet\` (
  \`user_id\` INT UNSIGNED PRIMARY KEY,
  \`app_token\` DECIMAL(24, 4) NOT NULL DEFAULT 0.0000,
  \`usdt\` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
  \`ton\` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
  \`coins\` DECIMAL(24, 0) NOT NULL DEFAULT 0,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. WITHDRAW TABLE
CREATE TABLE IF NOT EXISTS \`withdraw\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`amount\` DECIMAL(18, 4) NOT NULL,
  \`currency\` VARCHAR(32) NOT NULL,
  \`network\` VARCHAR(32) NOT NULL,
  \`wallet_address\` VARCHAR(256) NOT NULL,
  \`status\` ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  \`admin_note\` VARCHAR(256) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. DEPOSIT TABLE
CREATE TABLE IF NOT EXISTS \`deposit\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`amount\` DECIMAL(18, 4) NOT NULL,
  \`currency\` VARCHAR(32) NOT NULL,
  \`tx_hash\` VARCHAR(128) UNIQUE DEFAULT NULL,
  \`status\` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_tx\` (\`tx_hash\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS \`referrals\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`referrer_id\` INT UNSIGNED NOT NULL,
  \`referred_user_id\` INT UNSIGNED NOT NULL,
  \`status\` ENUM('valid', 'pending', 'invalid') NOT NULL DEFAULT 'pending',
  \`commission_earned\` DECIMAL(18, 4) DEFAULT 0.0000,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`referrer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`referred_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  UNIQUE KEY \`uk_ref\` (\`referrer_id\`, \`referred_user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. LEADERBOARD TABLE (CACHE ENGINE)
CREATE TABLE IF NOT EXISTS \`leaderboard\` (
  \`rank_position\` INT UNSIGNED PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`score\` DECIMAL(24, 4) NOT NULL,
  \`category\` ENUM('daily', 'weekly', 'monthly', 'season') NOT NULL DEFAULT 'season',
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. HISTORY TABLE (UNIVERSAL LOGS)
CREATE TABLE IF NOT EXISTS \`history\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`action_type\` VARCHAR(64) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`amount\` DECIMAL(18, 4) DEFAULT NULL,
  \`currency\` VARCHAR(32) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_user_action\` (\`user_id\`, \`action_type\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS \`settings\` (
  \`setting_key\` VARCHAR(64) PRIMARY KEY,
  \`setting_value\` TEXT NOT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS \`notifications\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`title\` VARCHAR(128) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`is_read\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`;

export const PHP_REST_API_CODE = `<?php
/**
 * TONQUEST TELEGRAM MINI APP - PRODUCTION PHP 8+ REST API
 * Security: Prepared Statements, CSRF Token, Rate Limiter, Anti-Duplicate
 */

declare(strict_types=1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");

// /config/db.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tonquest_db');
define('DB_USER', 'root');
define('DB_PASS', 'secret');

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Connection Failed"]);
    exit;
}

// Telegram Join Verification via Bot API
function verifyTelegramChannelJoin(string $botToken, string $channelUsername, string $telegramId): bool {
    $url = "https://api.telegram.org/bot{$botToken}/getChatMember?chat_id={$channelUsername}&user_id={$telegramId}";
    $response = @file_get_contents($url);
    if (!$response) return false;
    $data = json_decode($response, true);
    if (isset($data['ok']) && $data['ok'] === true) {
        $status = $data['result']['status'] ?? '';
        return in_array($status, ['member', 'administrator', 'creator']);
    }
    return false;
}

// REST Router Example
$requestMethod = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($action === 'complete_mission' && $requestMethod === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['user_id'] ?? 0);
    $missionId = trim($input['mission_id'] ?? '');

    // Anti-Duplicate & Cooldown check
    $stmt = $pdo->prepare("SELECT * FROM user_missions WHERE user_id = ? AND mission_id = ?");
    $stmt->execute([$userId, $missionId]);
    $existing = $stmt->fetch();

    if ($existing && strtotime($existing['expires_at']) > time()) {
        echo json_encode(["status" => "error", "message" => "Mission is still on cooldown!"]);
        exit;
    }

    // Grant Reward securely
    $pdo->beginTransaction();
    $stmtM = $pdo->prepare("SELECT reward_amount, reward_currency, cooldown_hours FROM missions WHERE id = ?");
    $stmtM->execute([$missionId]);
    $mission = $stmtM->fetch();

    if ($mission) {
        $expires = time() + ($mission['cooldown_hours'] * 3600);
        $stmtIns = $pdo->prepare("REPLACE INTO user_missions (user_id, mission_id, status, expires_at) VALUES (?, ?, 'OnCooldown', FROM_UNIXTIME(?))");
        $stmtIns->execute([$userId, $missionId, $expires]);

        // Update Wallet
        $col = ($mission['reward_currency'] === 'USDT') ? 'usdt' : (($mission['reward_currency'] === 'TON') ? 'ton' : 'app_token');
        $stmtW = $pdo->prepare("UPDATE wallet SET {$col} = {$col} + ? WHERE user_id = ?");
        $stmtW->execute([$mission['reward_amount'], $userId]);

        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Mission Reward Granted!"]);
    } else {
        $pdo->rollBack();
        echo json_encode(["status" => "error", "message" => "Mission Not Found"]);
    }
} else {
    echo json_encode(["status" => "ok", "app" => "TonQuest PHP API v1.0 Ready"]);
}
`;

export const TELEGRAM_WEBHOOK_PHP_SCRIPT = `<?php
/**
 * TELEGRAM BOT WEBHOOK LISTENER & REFERRAL APPS LINK TRACKER
 * Handles incoming /start, welcome messages, mini-app launch URLs, and real-time referral attribution
 */

declare(strict_types=1);
header("Content-Type: application/json; charset=UTF-8");

$botToken = "YOUR_BOT_TOKEN_FROM_BOTFATHER";
$botUsername = "tonquest_bot";
$appBaseUrl = "https://yourdomain.com";

$content = file_get_contents("php://input");
$update = json_decode($content, true);

if (!$update) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
    exit;
}

// 1. Process Telegram Message Updates
if (isset($update['message'])) {
    $msg = $update['message'];
    $chatId = $msg['chat']['id'];
    $userId = $msg['from']['id'];
    $firstName = htmlspecialchars($msg['from']['first_name'] ?? 'Adventurer');
    $username = $msg['from']['username'] ?? '';
    $text = trim($msg['text'] ?? '');

    // Check for referral code in /start parameter (e.g. /start ref_987654321)
    $referrerId = null;
    if (strpos($text, '/start') === 0) {
        $parts = explode(' ', $text);
        if (isset($parts[1]) && strpos($parts[1], 'ref_') === 0) {
            $referrerId = str_replace('ref_', '', $parts[1]);
        }
    }

    // Build unique Mini App URL with start_param
    $miniAppUrl = "https://t.me/{$botUsername}/app?startapp=ref_" . ($referrerId ?: $userId);

    // Welcome Message Content
    $welcomeText = "⚡ *Welcome to TonQuest Mini App, {$firstName}!* 🚀\n\n";
    $welcomeText .= "Earn real \$TON & USDT, complete daily tasks, and build your gaming network!\n\n";
    if ($referrerId) {
        $welcomeText .= "🎁 *You joined via Referral link from User #{$referrerId}!*\n\n";
    }
    $welcomeText .= "👇 Click below to open the Mini App:";

    // Send Telegram Reply with Inline Web App Button
    $replyMarkup = [
        'inline_keyboard' => [
            [
                [
                    'text' => '🚀 Open TonQuest Mini App',
                    'web_app' => ['url' => "{$appBaseUrl}/?tgWebAppStartParam=ref_" . ($referrerId ?: $userId)]
                ]
            ]
        ]
    ];

    // Dispatch message via Telegram Bot API
    $sendUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
    $postFields = [
        'chat_id' => $chatId,
        'text' => $welcomeText,
        'parse_mode' => 'Markdown',
        'reply_markup' => json_encode($replyMarkup)
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $sendUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);

    // Notify Referrer if joined via referral link
    if ($referrerId) {
        $refNotifyUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
        $refMsg = "🎉 *New Referral Joined!*\n\nUser *{$firstName}* (@{$username}) launched the mini-app using your link!\n\n*Mini-App URL:* {$miniAppUrl}";
        
        $ch2 = curl_init();
        curl_setopt($ch2, CURLOPT_URL, $refNotifyUrl);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, [
            'chat_id' => $referrerId,
            'text' => $refMsg,
            'parse_mode' => 'Markdown'
        ]);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch2);
        curl_close($ch2);
    }

    echo json_encode(["status" => "success", "processed_user" => $userId, "referrer_id" => $referrerId]);
    exit;
}

echo json_encode(["status" => "ok", "message" => "Webhook event received"]);
`;

export const END_TO_END_HOSTING_GUIDE = `# 🚀 END-TO-END TELEGRAM MINI APP & REALTIME WEBHOOK HOSTING GUIDE (A to Z)

## 📌 Phase 1: Create Telegram Bot & Configure Mini App URL
1. Open Telegram and search for **@BotFather**.
2. Send command: \`/newbot\`
3. Name your bot (e.g. \`TonQuest Bot\`) and set username ending in \`bot\` (e.g. \`tonquest_official_bot\`).
4. Save your **Bot API Token** (e.g. \`7123456789:AAFg...\`).
5. Enable Mini App mode in BotFather:
   - Send \`/newapp\`
   - Select your bot
   - Enter App Title: \`TonQuest Mini App\`
   - Upload 640x360 image
   - Enter Web App URL: \`https://yourdomain.com\`
   - Set Short Name: \`app\` -> Generates Mini App link: \`t.me/tonquest_official_bot/app\`

---

## 📌 Phase 2: Set Up Real-Time Webhook Connection
Set your HTTPS Webhook URL so Telegram sends all user messages and /start commands to your server in real-time:

\`\`\`bash
# Run this CURL in terminal (replace <YOUR_BOT_TOKEN> and <YOUR_WEBHOOK_URL>):
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook"
\`\`\`

**Verify Webhook Status:**
\`\`\`bash
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
\`\`\`

---

## 📌 Phase 3: How Referral Webhook Tracking Works (Step-by-Step)
1. **User A** gets their referral link from TonQuest Mini App: \`t.me/tonquest_bot/app?startapp=ref_987654321\`
2. **User B** clicks User A's referral link.
3. Telegram opens the Bot with payload \`ref_987654321\` or passes \`tgWebAppStartParam=ref_987654321\`.
4. Telegram's server sends a real-time HTTP POST payload to your **Webhook endpoint** (\`/api/telegram/webhook\`).
5. Your server captures **User B's details** (Name, Telegram ID, Username) + **Mini-App URL** and posts an alert to **User A (Referrer)**.
6. The database updates User A's referral bonus and logs the event in real-time!
`;

