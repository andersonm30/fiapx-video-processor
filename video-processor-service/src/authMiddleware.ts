import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import { DataSource } from "typeorm";

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import amqp from "amqplib";

const JWT_SECRET = process.env.JWT_SECRET || "fiapx-secret";
console.log("JWT_SECRET usado:", JWT_SECRET);

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

async function startWorker() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue("video-processing");

  console.log("Worker aguardando mensagens na fila 'video-processing'...");

  channel.consume("video-processing", (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log("Mensagem recebida:", content);

      // Simula processamento real
      console.log(`Processando vídeo: ${content.videoUrl}`);
      setTimeout(() => {
        console.log(`Processamento concluído para ID: ${content.id}`);
      }, 5000);

      channel.ack(msg);
    }
  });
}

startWorker().catch(console.error);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: ["src/models/*.ts"],
});