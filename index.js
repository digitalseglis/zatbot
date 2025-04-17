// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Estado
const TOKEN_SIMULADO = "MI_TOKEN_ZAPBOT";
let qrCodeData = "";
let isReady = false;

// WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', async qr => {
  isReady = false;
  qrCodeData = await qrcode.toDataURL(qr);
  console.log('📲 Escanea el QR en /auth');
});

client.on('ready', () => {
  isReady = true;
  qrCodeData = "";
  console.log('✅ WhatsApp conectado');
});

// 1) Endpoint para QR y token
app.get('/auth', (req, res) => {
  res.json({
    token: TOKEN_SIMULADO,
    qr: qrCodeData,
    status: isReady ? 'connected' : 'qr'
  });
});

// 2) Función que maneja envíos
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
    console.error(err);
    return res.status(500).json({ error: 'No pudo enviarse' });
  }
}

// 3) Rutas GET y POST para /send
app.get('/send', handleSend);
app.post('/send', handleSend);

// 4) Arrancar
app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Servidor en puerto ${port}`);
});
client.initialize();
