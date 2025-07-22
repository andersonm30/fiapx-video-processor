# Usar uma imagem base do Node.js
FROM node:18

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar os arquivos de dependências
COPY package.json package-lock.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Compilar TypeScript para JavaScript
RUN npm run build

# Expor a porta do serviço
EXPOSE 4000

# Comando para iniciar o serviço
CMD ["npm", "start"]