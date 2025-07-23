# Usar uma imagem base do Node.js
FROM node:18

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar os arquivos de configuração para o container
COPY package*.json ./

# Instalar as dependências
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3100
CMD ["npm", "run", "start"]
