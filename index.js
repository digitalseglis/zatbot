// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

// 1) Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Si tienes un HTML en /public

// 2) Estado interno
const TOKEN_ZAPBOT = process.env.TOKEN_ZAPBOT || 'MI_TOKEN_ZAPBOT';
const INSTANCE_ID   = "zapbot_" + Math.floor(Math.random()*10000);
let qrCodeData = '';
let isReady    = false;

// 3) Inicializar cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', async qr => {
  isReady     = false;
  qrCodeData  = await qrcode.toDataURL(qr);
  console.log('📲 QR generado — escanea en /auth');
});

client.on('ready', () => {
  isReady    = true;
  qrCodeData = '';
  console.log('✅ WhatsApp conectado');
});

// 4) Redirigir la raíz a /auth para no ver “Cannot GET /”
app.get('/', (req, res) => {
  res.redirect('/auth');
});

// 5) Endpoint /auth devuelve el QR, token y estado
app.get('/auth', (req, res) => {
  res.json({
    token:  TOKEN_ZAPBOT,
    qr:     qrCodeData,
    status: isReady ? 'connected' : 'qr'
  });
});

// 6) Función que maneja envíos de mensajes
async function handleSend(req, res) {
  const token   = req.query.token  || req.body.token;
  const to      = req.query.to     || req.body.to;
  const message = req.query.body   || req.body.body;

  if (token !== TOKEN_ZAPBOT) {
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
    res.json({ success: true });
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    res.status(500).json({ error: 'No pudo enviarse' });
  }
}

// 7) Rutas GET y POST para /send
app.get('/send',  handleSend);
app.post('/send', handleSend);

// 8) Arrancar el servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Servidor activo en puerto ${port}`);
});

client.initialize();
