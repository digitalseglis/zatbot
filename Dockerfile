# 1) Partimos de una imagen oficial de Node.js
FROM node:20-bullseye-slim

# 2) Instalamos dependencias necesarias para Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdbus-1-3 \
      libdrm2 \
      libxkbcommon0 \
      libx11-xcb1 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libxss1 \
      libgconf-2-4 \
      libnss3 \
      libasound2 \
      lsb-release \
      xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# 3) Definimos el directorio de trabajo
WORKDIR /app

# 4) Copiamos sólo package.json e instalamos deps
COPY package*.json ./
RUN npm install --production

# 5) Copiamos el resto de tu código
COPY . .

# 6) Le decimos a Puppeteer dónde está Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 7) Arrancamos tu script con npm start
CMD ["npm", "start"]
