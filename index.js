const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const TOKEN_SIMULADO = "MI_TOKEN_ZAPBOT";
const INSTANCE_ID = "zapbot_" + Math.floor(Math.random() * 10000);
let qrCodeData = "";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});

client.on('qr', async (qr) => {
    qrCodeData = await qrcode.toDataURL(qr);
    console.log('📲 Escanea el QR para conectar WhatsApp');
});

client.on('ready', () => {
    qrCodeData = "";
    console.log('✅ WhatsApp está conectado');
});

// Endpoint seguro para mostrar solo el QR y Token temporalmente
app.get('/auth', (req, res) => {
    res.json({
        instance: INSTANCE_ID,
        token: TOKEN_SIMULADO,
        qr: qrCodeData
    });
});

app.listen(port, () => {
    console.log(`🌐 Servidor activo en puerto ${port}`);
});

client.initialize();
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const TOKEN_SIMULADO = "MI_TOKEN_ZAPBOT";
const INSTANCE_ID = "zapbot_" + Math.floor(Math.random() * 10000);
let qrCodeData = "";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});

client.on('qr', async (qr) => {
    qrCodeData = await qrcode.toDataURL(qr);
    console.log('📲 Escanea el QR para conectar WhatsApp');
});

client.on('ready', () => {
    qrCodeData = "";
    console.log('✅ WhatsApp está conectado');
});

// Endpoint seguro para mostrar solo el QR y Token temporalmente
app.get('/auth', (req, res) => {
    res.json({
        instance: INSTANCE_ID,
        token: TOKEN_SIMULADO,
        qr: qrCodeData
    });
});

app.listen(port, () => {
    console.log(`🌐 Servidor activo en puerto ${port}`);
});

client.initialize();
