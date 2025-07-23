import express from 'express';
import authMiddleware from './middleware/auth';
import axios from 'axios';

const router = express.Router();

// Middleware de autenticação para rotas protegidas
router.use((req, res, next) => {
  // Permite login/register sem autenticação, protege o resto
  if (
    req.path === '/auth/login' ||
    req.path === '/auth/register'
  ) {
    return next();
  }
  return authMiddleware(req, res, next);
});

// Auth-service (login e register são públicas)
router.post('/auth/login', async (req, res) => {
  try {
    const response = await axios.post('http://auth-service:3200/login', req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const response = await axios.post('http://auth-service:3200/register', req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Video-processor-service
router.post('/video/upload', async (req, res) => {
  try {
    const response = await axios.post('http://video-processor-service:4000/upload', req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

router.get('/video/status/:id', async (req, res) => {
  try {
    const response = await axios.get(`http://video-processor-service:4000/status/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Notification-service
router.post('/notification/send', async (req, res) => {
  try {
    const response = await axios.post('http://notification-service:5000/send', req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

export default router;
