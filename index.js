// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const express  = require('express');
const cors     = require('cors');
const qrcode   = require('qrcode');
const path     = require('path');

const app = express();
const port = process.env.PORT || 3000;

// ——— Estado & Config ———
const TOKEN_SIMULADO = 'MI_TOKEN_ZAPBOT';
const INSTANCE_ID    = 'zapbot_' + Math.floor(Math.random()*10000);
let qrCodeData       = '';
let isReady          = false;

// ——— Middlewares ———
app.use(cors());
app.use(express.json());
// Sirve todo lo que pongas en /public (index.html, css, js, img…)
app.use(express.static(path.join(__dirname, 'public')));

// ——— WhatsApp Client ———
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', async qr => {
  isReady    = false;
  qrCodeData = await qrcode.toDataURL(qr);
  console.log('📲 QR generado – escanear en /auth');
});

client.on('ready', () => {
  isReady    = true;
  qrCodeData = '';
  console.log('✅ WhatsApp conectado');
});

// ——— Rutas ———

// 1) Raíz: sirve public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2) /auth: devuelve token, instancia, QR y estado
app.get('/auth', (req, res) => {
  res.json({
    token:    TOKEN_SIMULADO,
    instance: INSTANCE_ID,
    qr:       qrCodeData,
    status:   isReady ? 'connected' : 'qr'
  });
});

// 3) Función para /send
async function handleSend(req, res) {
  const token   = req.query.token || req.body.token;
  const to      = req.query.to    || req.body.to;
  const message = req.query.body  || req.body.body;

  if (token !== TOKEN_SIMULADO) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  if (!to || !message) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp no conectado' });
  }

  const chatId = to.replace(/\D/g, '') + '@c.us';
  try {
    await client.sendMessage(chatId, message);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    return res.status(500).json({ error: 'No pudo enviarse el mensaje' });
  }
}

// 4) /send: GET y POST
app.get('/send', handleSend);
app.post('/send', handleSend);

// 5) Cualquier otra ruta → 404 JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ——— Arrancar servidor & cliente ———
app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Servidor activo en puerto ${port}`);
});
client.initialize();
