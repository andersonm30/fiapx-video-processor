import request from "supertest";
import { app } from "../index";
import jwt from "jsonwebtoken";

const validToken = jwt.sign(
  { id: 1, username: "usuario1" },
  "aj6I4zJ4jxT1Vsk8q3!q8*2%T91m4G5n7w1B9Xk2tR6sE0V1", // igual ao JWT_SECRET do serviço
  { expiresIn: "1h" }
);

describe("Testar o endpoint /process", () => {
  it("Deve retornar erro para vídeos maiores que 500MB", async () => {
    const response = await request(app)
      .post("/process")
      .set("Authorization", `Bearer ${validToken}`)
      .attach("video", Buffer.alloc(500 * 1024 * 1024 + 1), "large-video.mp4");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O tamanho do vídeo excede o limite de 500MB.");
  });

  it("Deve retornar erro para formatos de vídeo não suportados", async () => {
    const response = await request(app)
      .post("/process")
      .set("Authorization", `Bearer ${validToken}`)
      .attach("video", Buffer.alloc(1 * 1024 * 1024), "unsupported-format.txt");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Extensão de arquivo não permitida. Permitido: .mp4");
  });

  it("Deve processar vídeos válidos corretamente", async () => {
    const response = await request(app)
      .post("/process")
      .set("Authorization", `Bearer ${validToken}`)
      .attach("video", Buffer.alloc(1 * 1024 * 1024), "valid-video.mp4");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Vídeo recebido e será processado!");
    expect(response.body.id).toBeDefined();
  });
});

afterAll(() => {
  // Não precisa de process.exit(0)! Se necessário, só para debug local.
});
