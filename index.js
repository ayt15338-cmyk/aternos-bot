const { execSync } = require('child_process');
const http = require('http');

try { require.resolve('mineflayer'); }
catch {
  console.log('📦 Installing mineflayer...');
  execSync('npm install mineflayer', { stdio: 'inherit' });
}
const mineflayer = require('mineflayer');

// ✅ CONFIG
const IP = 'Endless258.aternos.me';       // Minecraft server IP
const PORT = 50247;              // Server port
const WEB_PORT = process.env.PORT || 3000; // Fake port for Render/web host
const PASSWORD = 'Mishra@123';

let logs = [];
let bot;

// 🧠 Log helper
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  logs.push(line);
  if (logs.length > 100) logs.shift();
}

// 🎲 Generate new name
function randomUsername() {
  return 'BOT_' + Math.floor(Math.random() * 100000);
}

// 🤖 Infinite bot reconnect loop
function startBotLoop() {
  const username = randomUsername();
  log(`🔁 Connecting as ${username}...`);

  bot = mineflayer.createBot({
    host: IP,
    port: PORT,
    username
  });

  bot.on('spawn', () => {
    log(`✅ ${username} spawned`);
    setTimeout(() => bot.chat(`/register ${PASSWORD} ${PASSWORD}`), 2000);
    setTimeout(() => bot.chat(`/login ${PASSWORD}`), 4000);
  });

  bot.on('kicked', reason => {
    log(`🚫 Kicked: ${reason}`);
  });

  bot.on('error', err => {
    log(`⚠️ Error: ${err.message}`);
  });

  bot.on('end', () => {
    log(`🔌 Bot disconnected. Rejoining in 5s...`);
    setTimeout(startBotLoop, 5000);
  });
}

startBotLoop();

// 🌐 Minimal Web Server
http.createServer((req, res) => {
  if (req.url === '/logs') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(logs.join('\n'));
  } else {
    res.writeHead(200);
    res.end('Bot is running.\nUse /logs to view output.');
  }
}).listen(WEB_PORT, () => {
  log(`🌍 Web server running on port ${WEB_PORT}`);
});
