import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export async function getRabbitChannel() {
  if (channel) return channel;
  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();
  await channel.assertQueue("video-processing");
  return channel;
}