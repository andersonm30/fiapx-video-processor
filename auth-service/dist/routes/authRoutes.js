"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../data-source");
const User_1 = require("../models/User");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Usuário já existe
 *       500:
 *         description: Erro ao registrar usuário
 */
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    try {
        const exists = await userRepo.findOneBy({ username });
        if (exists)
            return res.status(400).json({ error: "Usuário já existe" });
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = userRepo.create({ username, password: hashedPassword });
        await userRepo.save(user);
        res.status(201).json({ message: "Usuário criado com sucesso" });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao registrar usuário" });
    }
});
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro ao fazer login
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    try {
        const user = await userRepo.findOneBy({ username });
        if (!user)
            return res.status(401).json({ error: "Credenciais inválidas" });
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ error: "Credenciais inválidas" });
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ error: "JWT_SECRET não configurado no ambiente" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, jwtSecret, {
            expiresIn: "1h",
        });
        res.json({ message: "Login realizado com sucesso", token });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao fazer login" });
    }
});
/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Rota protegida por JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acesso autorizado
 *       401:
 *         description: Não autorizado
 */
router.get("/protected", authMiddleware_1.authMiddleware, (req, res) => {
    // @ts-ignore (caso não tenha tipado o req.user)
    res.json({ message: `Bem-vindo, ${req.user.username}!` });
});
exports.default = router;
