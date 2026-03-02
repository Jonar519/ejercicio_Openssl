// importiamo il modulo di websocket
const WebSocket = require('ws');

// 1. Creazione del server WebSocket nel porto 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log("🚀 Servidor WebSocket iniciado en ws://localhost:8080");

// Función para generar datos aleatorios
const generarDatos = () => {
    const nombres = ["Sensor_Alfa", "Sensor_Beta", "Sensor_Gamma", "Sensor_Delta"];
    return JSON.stringify({
        id: Math.floor(Math.random() * 1000),
        nombre: nombres[Math.floor(Math.random() * nombres.length)],
        temperatura: (Math.random() * (40 - 20) + 20).toFixed(2) + "°C"
    });
};

wss.on('connection', (ws) => {
    console.log("✅ Nuevo cliente conectado");

    // 2. Si invia i dati ogni 2 secondi
    const intervalo = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(generarDatos());
        }
    }, 2000);

    ws.on('close', () => {
        console.log("❌ Cliente desconectado");
        clearInterval(intervalo);
    });
});