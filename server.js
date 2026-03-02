const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

// Verificar que los certificados existen
try {
    fs.accessSync('cert.pem', fs.constants.R_OK);
    fs.accessSync('key.pem', fs.constants.R_OK);
    console.log('✅ Certificados encontrados');
} catch (err) {
    console.error('❌ No se encuentran los certificados. Generándolos...');
    // Generar certificados automáticamente si no existen
    const { execSync } = require('child_process');
    execSync('openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"');
    console.log('✅ Certificados generados');
}

// Opciones SSL
const options = {
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem'),
    rejectUnauthorized: false // Solo para desarrollo
};

// Crear servidor HTTPS
const server = https.createServer(options);

// Servir archivo HTML para pruebas (opcional)
server.on('request', (req, res) => {
    if (req.url === '/') {
        fs.readFile('cliente.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Archivo no encontrado');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

const wss = new WebSocket.Server({ server });

console.log('🚀 Iniciando servidor WSS...');

wss.on('error', (error) => {
    console.error('❌ Error en WebSocket:', error);
});

wss.on('listening', () => {
    console.log('📡 WebSocket server listening');
});

wss.on('connection', (ws, req) => {
    console.log('✅ Cliente conectado desde:', req.socket.remoteAddress);
    
    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Conectado al servidor WSS',
        timestamp: new Date().toISOString()
    }));

    // Enviar datos cada 2 segundos
    const intervalo = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const datos = {
                id: Math.floor(Math.random() * 1000),
                nombre: `Sensor-${Math.floor(Math.random() * 100)}`,
                temperatura: (Math.random() * 30 + 10).toFixed(1),
                timestamp: new Date().toISOString()
            };
            
            ws.send(JSON.stringify(datos));
            console.log('📤 Datos enviados:', datos);
        }
    }, 2000);

    ws.on('message', (msg) => {
        console.log('📨 Mensaje recibido:', msg.toString());
    });

    ws.on('close', () => {
        clearInterval(intervalo);
        console.log('❌ Cliente desconectado');
    });

    ws.on('error', (error) => {
        console.error('❌ Error en conexión WebSocket:', error);
    });
});

// Manejar errores del servidor
server.on('error', (error) => {
    console.error('❌ Error del servidor:', error);
});

// Escuchar en todas las interfaces
server.listen(8080, '0.0.0.0', () => {
    console.log('\n✅ Servidor WSS corriendo correctamente');
    console.log('📡 WebSocket URL: wss://localhost:8080');
    console.log('🌐 HTTP URL: https://localhost:8080');
    console.log('🔒 Usando certificado autofirmado - acepta la advertencia en el navegador\n');
});