const express = require('express');
const { Client } = require('whatsapp-web.js');
const QRCode = require('qrcode');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new Client();
let qrCodeImage = '';

client.on('qr', (qr) => {
    console.log('QR Code generado');
    QRCode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error al generar el QR:', err);
            return;
        }
        qrCodeImage = url;
        console.log('QR Code almacenado');
    });
});

client.on('ready', () => {
    console.log('Cliente está listo!');
});

client.on('auth_failure', () => {
    console.error('Autenticación fallida');
});

client.on('authenticated', () => {
    console.log('Autenticado con éxito');
});

client.on('disconnected', () => {
    console.log('Cliente desconectado');
});

client.initialize();

// Ruta para obtener la imagen QR
app.get('/qr', (req, res) => {
    if (qrCodeImage) {
        res.send(`<img src="${qrCodeImage}" alt="QR Code" />`);
    } else {
        res.send('No se ha generado el QR Code aún.');
    }
});

// Ruta para enviar mensajes
app.post('/send-message', (req, res) => {
    const { number, message } = req.body;

    client.sendMessage(`${number}@c.us`, message)
        .then(response => {
            if (response.id.fromMe) {
                res.send('Mensaje enviado con éxito.');
            } else {
                res.status(500).send('Error al enviar el mensaje.');
            }
        })
        .catch(err => {
            res.status(500).send('Error al enviar el mensaje: ' + err);
        });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
