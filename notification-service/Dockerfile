# Usar uma imagem base do Node.js
FROM node:18

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar os arquivos de configuração para o container
COPY package*.json ./

# Instalar as dependências
RUN npm install
COPY . .
COPY .env .env
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]
