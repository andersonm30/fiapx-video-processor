import { OpenAPIV3 } from 'openapi-types';

const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'API Gateway Documentation',
    version: '1.0.0',
    description: 'Documentação das rotas do API Gateway',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor local',
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login de usuário',
        description: 'Autentica o usuário e retorna um token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Registro de usuário',
        description: 'Registra um novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário registrado com sucesso',
          },
          400: {
            description: 'Erro na validação dos dados',
          },
        },
      },
    },
    '/video/upload': {
      post: {
        summary: 'Upload de vídeo',
        description: 'Envia um vídeo para processamento',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  videoUrl: { type: 'string' },
                },
                required: ['videoUrl'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Vídeo enviado com sucesso',
          },
          500: {
            description: 'Erro no processamento do vídeo',
          },
        },
      },
    },
    '/video/status/{id}': {
      get: {
        summary: 'Status do vídeo',
        description: 'Consulta o status de processamento de um vídeo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID do vídeo',
          },
        ],
        responses: {
          200: {
            description: 'Status retornado com sucesso',
          },
          404: {
            description: 'Vídeo não encontrado',
          },
        },
      },
    },
    '/notification/send': {
      post: {
        summary: 'Enviar notificação',
        description: 'Envia uma notificação para o usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  message: { type: 'string' },
                },
                required: ['email', 'message'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Notificação enviada com sucesso',
          },
          500: {
            description: 'Erro ao enviar notificação',
          },
        },
      },
    },
  },
};

export default swaggerDocument;