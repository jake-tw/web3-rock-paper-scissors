FROM node:16-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY hardhat.config.ts ./
RUN npm install
COPY scripts scripts
COPY contracts contracts
RUN npx hardhat compile

CMD [ "npx","hardhat", "node" ]