FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar todo el código
COPY . .

# Crear directorio de datos persistentes
RUN mkdir -p /data/acdp

# El servidor corre en el puerto configurado (default 3100)
EXPOSE 3100

ENV NODE_ENV=production

CMD ["node", "acdp-socket-server/entrypoint.js"]
