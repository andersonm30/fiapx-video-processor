"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const swagger_1 = require("./swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Não coloque prefixo aqui:
app.use(authRoutes_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "Auth service running!" });
});
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Banco de dados conectado!");
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Auth service on port ${PORT}`);
    });
})
    .catch((error) => console.log("Erro ao conectar ao banco de dados:", error));
(0, swagger_1.setupSwagger)(app);
