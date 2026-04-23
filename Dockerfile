FROM node:20

WORKDIR /app

COPY backend/package*.json ./backend/
WORKDIR /app/backend

RUN npm install

COPY backend/ .

EXPOSE 8080

CMD ["npm", "start"]