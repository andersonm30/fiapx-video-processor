import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "video_processor_db",
  synchronize: true, // Sincroniza automaticamente as entidades com o banco
  logging: false,
  entities: ["src/models/*.ts"], // Certifique-se de que o caminho está correto
});