"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = require("express");
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token)
        return res.status(401).json({ error: "Token não fornecido" });
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ error: "JWT_SECRET não configurado no ambiente" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded; // Adiciona o usuário decodificado à requisição
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Token inválido" });
    }
};
exports.authMiddleware = authMiddleware;
// Exemplo de rota protegida
const router = (0, express_1.Router)();
router.get("/protected", exports.authMiddleware, (req, res) => {
    res.json({ message: `Bem-vindo, ${req.user.username}!` });
});
exports.default = router;
