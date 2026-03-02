const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("Cliente conectado (WSS)");

    const interval = setInterval(() => {
        const sensor = {
            id: 1,
            nombre: "Sensor Norte",
            temperatura: (Math.random() * 30).toFixed(2)
        };

        ws.send(JSON.stringify(sensor));
    }, 2000);

    ws.on('close', () => {
        console.log("Cliente desconectado");
        clearInterval(interval);
    });
});

server.listen(8080, () => {
    console.log("Servidor WSS en puerto 8080");
});
