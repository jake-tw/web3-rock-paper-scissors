#!/bin/bash

export PROJECT_BASE_DIR=$PWD

echo "build rps-contract image."
cd $PROJECT_BASE_DIR/rps-contract
docker build . -t rps-contract

echo "build rps-backend image."
cd $PROJECT_BASE_DIR/rps-backend
docker build . -t rps-backend

cd $PROJECT_BASE_DIR/

docker-compose -p rps -f docker-compose.yml up -d rps-db rps-pgadmin

docker-compose -p rps -f docker-compose.yml up -d rps-contract
docker exec -it rps-contract npx hardhat run scripts/deploy.ts

docker-compose -p rps -f docker-compose.yml up -d rps-backend

docker image prune -f
