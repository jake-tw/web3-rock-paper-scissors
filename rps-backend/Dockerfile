FROM node:16 AS builder

WORKDIR /build

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig* ./
# RUN npm set-script prepare ""
RUN npm install
COPY src src
RUN npm run build


FROM node:16-alpine

WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
EXPOSE 3000

CMD ["node", "./dist/main.js"]