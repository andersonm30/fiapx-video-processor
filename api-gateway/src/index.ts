import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.GATEWAY_PORT || 8000;

app.get('/gateway/health', (req: Request, res: Response) => {
  res.json({ status: 'API Gateway is running' });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API-GATEWAY] Proxying: ${req.method} ${req.originalUrl}`);
  next();
});

// PROXY para /proxy (SEM pathRewrite)
app.use(
  '/proxy',
  createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true
    // logLevel: 'debug' // Removido para evitar erro de tipagem
  } as any) // Força a aceitar opções extras caso precise no futuro
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
