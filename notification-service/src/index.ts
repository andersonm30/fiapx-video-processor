import amqp from "amqplib";

// Use variável de ambiente para facilitar deploy!
const amqpUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq";

async function startNotificationService() {
  const connection = await amqp.connect(amqpUrl);
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
