import express from 'express';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
// Se for swagger.json, troque para: import * as swaggerDocument from './swagger.json';
import swaggerDocument from './swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rotas principais da API
app.use('/api', routes);

// Configuração do Swagger (documentação)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
  console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
});
