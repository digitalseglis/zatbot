const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares ----------------------------------
app.use(cors());
app.use(express.json());      // para parsear JSON en POST
app.use(express.static('public')); // si tienes un front en /public

// --- Configuración de seguridad ------------------
const TOKEN_SIMULADO = "MI_TOKEN_ZAPBOT"; 
// Nota: quien llame a /send debe pasar este token correcto o recibirá 401

// --- Estado de la sesión WhatsApp ----------------
const INSTANCE_ID = "zapbot_" + Math.floor(Math.random() * 10000);
let qrCodeData = "";    // guarda la última imagen QR en base64
let isReady = false;    // indica si client está conectado

// --- Inicializar cliente de WhatsApp --------------
const client = new Client({
  authStrategy: new LocalAuth(), 
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', async qr => {
  isReady = false;
  qrCodeData = await qrcode.toDataURL(qr);
  console.log('📲 Escanea el QR para conectar WhatsApp');
});

client.on('ready', () => {
  isReady = true;
  qrCodeData = "";
  console.log('✅ WhatsApp está conectado');
});

// --- Endpoint para obtener estado / QR / token ----
app.get('/auth', (req, res) => {
  res.json({
    instance: INSTANCE_ID,
    token: TOKEN_SIMULADO,
    qr: qrCodeData,
    status: isReady ? 'connected' : 'qr'
  });
});

// --- Función que maneja el envío de mensajes -------
async function handleSendMessage(req, res) {
  // token puede venir por query or body
  const token   = req.query.token || req.body.token;
  const to      = req.query.to    || req.body.to;
  const message = req.query.body  || req.body.body;

  // 1) Validar token
  if (token !== TOKEN_SIMULADO) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // 2) Validar parámetros
  if (!to || !message) {
    return res.status(400).json({ error: 'Faltan "to" o "body"' });
  }

  // 3) Formatear el chatId
  const chatId = to.replace(/\D/g, '') + "@c.us";

  // 4) Intentar enviar
  try {
    if (!isReady) {
      return res.status(503).json({ error: 'WhatsApp no está conectado aún' });
    }
    await client.sendMessage(chatId, message);
    return res.json({ success: true, to, message });
  } catch (err) {
    console.error('❌ Error al enviar mensaje:', err);
    return res.status(500).json({ error: 'Error interno al enviar mensaje' });
  }
}

// --- Rutas de envío GET y POST --------------------
app.get('/send', handleSendMessage);
app.post('/send', handleSendMessage);

// --- Arrancar el servidor --------------------------
app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Servidor activo en puerto ${port}`);
});

// --- Conectar cliente WhatsApp ---------------------
client.initialize();
