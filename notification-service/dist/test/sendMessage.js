"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
async function sendMessage() {
    const connection = await amqplib_1.default.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "notifications";
    const message = {
        type: "error",
        email: "usuario@example.com",
        message: "Erro ao processar vídeo: Vídeo não encontrado.",
    };
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log("Mensagem enviada para a fila 'notifications':", message);
    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}
sendMessage().catch(console.error);
