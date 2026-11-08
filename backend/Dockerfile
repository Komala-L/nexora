FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --no-audit --no-fund

COPY . .

RUN mkdir -p logs && chown -R node:node /app

USER node

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
