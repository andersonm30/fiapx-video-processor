import { AppDataSource } from "./data-source";
import { Video } from "./models/Video";
import amqp from "amqplib";

async function startWorker() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue("video-processing");
  await channel.assertQueue("notifications"); // <-- Adiciona fila de notificações

  console.log("Worker aguardando mensagens na fila 'video-processing'...");

  channel.consume("video-processing", async (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log("Mensagem recebida:", content);

      try {
        const videoRepository = AppDataSource.getRepository(Video);
        const video = await videoRepository.findOneBy({ id: content.id });
        if (video) {
          video.status = "done" as Video["status"];
          await videoRepository.save(video);
          console.log(`Processamento concluído para ID: ${content.id}`);

          // --- Notificação de sucesso ---
          const notification = {
            type: "success",
            videoId: video.id,
            status: video.status,
            message: `Vídeo processado com sucesso!`,
            timestamp: new Date().toISOString()
          };
          channel.sendToQueue("notifications", Buffer.from(JSON.stringify(notification)));
        } else {
          // Video não encontrado (simulando erro)
          throw new Error("Vídeo não encontrado no banco de dados");
        }
      } catch (error) {
        console.error(`Erro ao processar vídeo ${content.id}:`, error);

        // Publica mensagem na fila de notificações
        let errorMessage: string;
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }
        const notification = {
          type: "error",
          videoId: content.id,
          message: `Erro ao processar vídeo: ${errorMessage}`,
          timestamp: new Date().toISOString()
        };
        channel.sendToQueue("notifications", Buffer.from(JSON.stringify(notification)));
      }

      channel.ack(msg);
    }
  });
}

startWorker().catch(console.error);
