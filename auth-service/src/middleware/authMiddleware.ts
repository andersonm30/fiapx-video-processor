import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, Router } from "express";

// Extende a interface Request para incluir a propriedade 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET não configurado no ambiente" });
    }
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Adiciona o usuário decodificado à requisição
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Exemplo de rota protegida
const router = Router();

router.get("/protected", authMiddleware, (req: Request, res: Response) => {
  res.json({ message: `Bem-vindo, ${req.user.username}!` });
});

export default router;