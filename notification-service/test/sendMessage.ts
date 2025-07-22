import amqp from "amqplib";

async function sendMessage() {
  const connection = await amqp.connect("amqp://localhost");
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