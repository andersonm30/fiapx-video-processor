# FIAPX Video Processor - Hackathon 2024

Sistema de processamento de vídeos orientado a microsserviços, usando autenticação JWT, mensageria, Docker, CI/CD, monitoramento e documentação completa.

---

## 🏗️ Arquitetura de Microsserviços

### Serviços

- **auth-service:** Responsável por login, registro e emissão de JWT. Todas as rotas (exceto `/login` e `/register`) exigem autenticação via JWT.
- **video-processor-service:** Recebe vídeos, publica jobs na fila RabbitMQ, processa vídeos em background, expõe status e permite download do ZIP processado.
- **notification-service:** Consome mensagens da fila `notifications` e, nesta versão, simula o envio de e-mails para notificar o usuário em caso de erro.
- **RabbitMQ:** Gerencia filas para processamento assíncrono e notificações, garantindo que requisições não sejam perdidas em picos.
- **PostgreSQL:** Persistência de usuários, vídeos, status de processamento.
- **Docker Compose:** Orquestra todos os serviços para facilitar o deploy e escalabilidade.

---

## 📋 Premissas adotadas

- Upload de vídeos de até 500MB.
- Geração de arquivo .zip com as imagens extraídas do vídeo.
- Exclusão do vídeo do servidor após a geração do arquivo .zip, garantindo a privacidade dos dados.
- O arquivo .zip poderá conter no máximo 10 imagens.
- Arquitetura escalável e pronta para produção.

---

## 🔐 Autenticação JWT

- Todas as rotas (exceto `/login` e `/register`) exigem autenticação via JWT.
- **Como obter o token:**
  1. Faça login via `POST /login` no `auth-service` com email e senha.
  2. O token JWT será retornado na resposta.
- **Como usar:**
  - Inclua o header:  
    `Authorization: Bearer SEU_TOKEN_JWT`

---

## 🔄 Fluxo Resumido

1. Usuário faz login/registro (**Auth Service**)
2. Envia vídeo (**Video Processor Service**)
3. Serviço publica mensagem na fila (**RabbitMQ**)
4. Worker processa vídeo e atualiza status (**Banco de Dados**)
5. Se erro, envia notificação (**RabbitMQ**) → **Notification Service** loga (ou notifica)
6. Usuário pode consultar status autenticado

---

## 📨 Notification Service

O `notification-service` consome mensagens da fila `notifications` e, nesta versão, simula o envio de e-mails para notificar o usuário em caso de erro.

### Como rodar/testar o Notification Service
1. No terminal, acesse a pasta do serviço:
   ```bash
   cd notification-service
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode o serviço:
   ```bash
   npx ts-node src/index.ts
   ```
4. Envie uma mensagem para a fila `notifications` com o formato:
   ```json
   {
     "type": "error",
     "email": "usuario@example.com",
     "message": "Erro ao processar vídeo: Vídeo não encontrado."
   }
   ```
5. Verifique no console se a mensagem simulada aparece corretamente.

---

## 🐳 Docker Compose

Todos os serviços podem ser orquestrados com Docker Compose.

**Exemplo de comando:**
```bash
docker compose up --build
```

**Trecho do docker-compose.yml:**
```yaml
services:
  auth-service:
    build: ./auth-service
    ports:
      - "3000:3000"
  video-processor-service:
    build: ./video-processor-service
    ports:
      - "4000:4000"
  notification-service:
    build: ./notification-service
    ports:
      - "5000:5000"
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: video_processor_db
    ports:
      - "5432:5432"
```

---

## 🗺️ Diagrama da Arquitetura

O diagrama da arquitetura está disponível no arquivo [`FIAP-Pos-Tech-Hackathon-Arquitetura.drawio`](./documentacao/FIAP-Pos-Tech-Hackathon-Arquitetura.drawio).

### Como editar o diagrama
1. Abra o arquivo no [Draw.io](https://app.diagrams.net/) ou no VS Code com a extensão Draw.io instalada.
2. Faça as alterações necessárias para refletir a arquitetura atual.
3. Salve o arquivo e exporte como PNG para atualizar o diagrama visual.

### Como visualizar
A versão exportada do diagrama pode ser encontrada em:  
![Diagrama da Arquitetura](./documentacao/arquitetura.png)

---

## 🚀 CI/CD

O projeto utiliza GitHub Actions para automação de build, testes e deploy.

### Pipeline
1. **Build:** Compila os serviços e verifica dependências.
2. **Testes:** Executa os testes unitários e de integração.
3. **Deploy:** Publica os containers no ambiente configurado.

### Como configurar
- Certifique-se de que os workflows estão na pasta `.github/workflows`.
- Configure variáveis de ambiente no GitHub Actions para autenticação e deploy.

### Exemplo de Workflow
Aqui está um exemplo de workflow para CI/CD utilizando GitHub Actions:

```yaml
# filepath: .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout código
        uses: actions/checkout@v2

      - name: Configurar Docker
        run: |
          docker-compose build

  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout código
        uses: actions/checkout@v2

      - name: Executar testes
        run: |
          npm run test

  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]
    steps:
      - name: Deploy containers
        run: |
          docker-compose up -d
```

---

## 📊 Monitoramento com Prometheus e Grafana

### Configuração
1. Certifique-se de que o `prometheus.yml` está configurado corretamente.
2. Inicie o Prometheus e Grafana com Docker Compose:
   ```bash
   docker compose up prometheus grafana
   ```
3. Acesse o Prometheus em `http://localhost:9090` e Grafana em `http://localhost:3000`.

---

## 📜 Logs Estruturados

Os serviços utilizam logs estruturados para facilitar o monitoramento e depuração.

### Configuração
1. Certifique-se de que cada serviço está configurado para gerar logs no formato JSON.
2. Use ferramentas como ELK Stack (Elasticsearch, Logstash, Kibana) para centralizar os logs.
3. Configure o Docker para redirecionar logs para um arquivo ou serviço externo:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

---

## 🧪 Testes

- Há pelo menos um teste unitário por serviço como exemplo.
- Para rodar os testes:
  ```bash
  npm run test
  ```
  Execute este comando dentro de cada serviço.

---

## 📋 Limitações e sugestões futuras

- O sistema suporta processar vídeos simultaneamente enquanto houver worker suficiente.
- Em produção, recomenda-se adicionar:
  - Monitoramento (Prometheus, Grafana)
  - Logs estruturados
  - Escalabilidade horizontal dos workers
  - Notificações reais (e-mail, push)
  - Cache com Redis para status

---

## ⚙️ Escalabilidade Horizontal

### Configuração
1. Certifique-se de que o RabbitMQ está configurado para suportar múltiplos consumidores.
2. Escale os workers com Docker Compose:
   ```bash
   docker compose up --scale video-processor-service=3
   ```

---

Hackathon FIAPX - Pós FIAP