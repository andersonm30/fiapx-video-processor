import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/authRoutes";
import { setupSwagger } from "./swagger";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// Não coloque prefixo aqui:
app.use(authRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "Auth service running!" });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Banco de dados conectado!");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Auth service on port ${PORT}`);
        });
    })
    .catch((error) => console.log("Erro ao conectar ao banco de dados:", error));

setupSwagger(app);
