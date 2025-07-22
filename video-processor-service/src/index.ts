import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { getRabbitChannel } from "./rabbitmq";
import { authenticateJWT } from "./authMiddleware";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import expressFileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import client from "prom-client";

dotenv.config();

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

export { app }; // Exportando diretamente
app.use(cors());
app.use(express.json());
app.use(expressFileUpload());

// Banco em memória para status dos vídeos
const videoStatus: { [id: string]: { status: string, videoUrl: string, zipPath?: string } } = {};

const JWT_SECRET = process.env.JWT_SECRET || "fiapx-secret";

app.get("/health", (req, res) => {
  res.json({ status: "Video Processor running!" });
});

/**
 * @swagger
 * /process:
 *   post:
 *     summary: Envia um vídeo para processamento
 *     tags:
 *       - Video Processor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Vídeo recebido e será processado
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Token não fornecido ou inválido
 */
app.post("/process", authenticateJWT, async (req, res) => {
  if (!req.files || !req.files.video) {
    return res.status(400).json({ error: "O arquivo de vídeo é obrigatório." });
  }

  const video = req.files.video as expressFileUpload.UploadedFile;

  // Validação do tamanho do arquivo (500MB = 500 * 1024 * 1024 bytes)
  const MAX_SIZE = 500 * 1024 * 1024;
  if (video.size > MAX_SIZE) {
    return res.status(400).json({ error: "O tamanho do vídeo excede o limite de 500MB." });
  }

  const allowedExtensions = [".mp4"];
  const fileExtension = path.extname(video.name).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: `Extensão de arquivo não permitida. Permitido: ${allowedExtensions.join(", ")}` });
  }

  const id = randomUUID();
  const videoPath = path.join(__dirname, "../uploads", `${id}.mp4`);
  const outputDir = path.join(__dirname, "../processed", id);
  const zipPath = path.join(__dirname, "../processed", `${id}_frames.zip`);

  videoStatus[id] = { status: "processing", videoUrl: video.name };

  // Certifique-se de que os diretórios existem
  if (!fs.existsSync(path.join(__dirname, "../uploads"))) {
    fs.mkdirSync(path.join(__dirname, "../uploads"), { recursive: true });
  }
  if (!fs.existsSync(path.join(__dirname, "../processed"))) {
    fs.mkdirSync(path.join(__dirname, "../processed"), { recursive: true });
  }

  // Salvar o vídeo no servidor
  video.mv(videoPath, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao salvar o vídeo." });
    }

    // Simula processamento assíncrono
    setTimeout(async () => {
      try {
        // Criação de frames (simulado)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outputDir, "frame_0001.png"), "Simulated frame content");

        const MAX_IMAGES = 10; // Limite de imagens no .zip

        // Simula a criação de frames
        for (let i = 1; i <= MAX_IMAGES; i++) {
          fs.writeFileSync(path.join(outputDir, `frame_${String(i).padStart(4, "0")}.png`), "Simulated frame content");
        }

        // Criação do ZIP
        await createZip(outputDir, zipPath);

        // Exclusão do vídeo original
        fs.unlinkSync(videoPath);

        videoStatus[id] = { status: "done", videoUrl: video.name, zipPath };
        console.log(`✅ Vídeo ${id} processado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao processar vídeo ${id}:`, error);
        videoStatus[id].status = "failed";
      }
    }, 5000);

    res.json({ message: "Vídeo recebido e será processado!", id });
  });
});

/**
 * @swagger
 * /status/{id}:
 *   get:
 *     summary: Consulta o status de um vídeo
 *     tags:
 *       - Video Processor
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status do vídeo
 *       404:
 *         description: ID não encontrado
 */
app.get("/status/:id", (req, res) => {
  const { id } = req.params;
  const status = videoStatus[id];
  if (!status) {
    return res.status(404).json({ error: "ID não encontrado" });
  }
  res.json({ id, ...status });
});

// Função para criar ZIP
async function createZip(sourceDir: string, zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`📦 ZIP criado: ${zipPath}`);
      resolve();
    });

    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Video Processor API",
      version: "1.0.0",
      description: "API para processamento de vídeos",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/index.ts"], // Arquivos onde estão as rotas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Iniciar o servidor apenas se este arquivo for o principal
if (require.main === module) {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  app.listen(PORT, () => {
    console.log(`Video Processor service on port ${PORT}`);
  });
}