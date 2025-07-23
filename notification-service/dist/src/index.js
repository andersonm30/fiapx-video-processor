"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
async function startNotificationService() {
    const connection = await amqplib_1.default.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("notifications");
    console.log("Notification Service aguardando mensagens na fila 'notifications'...");
    channel.consume("notifications", async (msg) => {
        if (msg) {
            const notification = JSON.parse(msg.content.toString());
            console.log("Notificação recebida:", notification);
            // Simular envio de e-mail
            console.log(`Simulando envio de e-mail para: ${notification.email}`);
            console.log(`Assunto: Notificação de Erro no Processamento de Vídeo`);
            console.log(`Mensagem: ${notification.message}`);
            channel.ack(msg);
        }
    });
}
startNotificationService().catch(console.error);
