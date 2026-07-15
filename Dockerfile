# Stage 1: Build Vue Frontend
FROM node:22-alpine AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Setup Express Backend
FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
# Copy built Vue app to backend's public directory
COPY --from=build-stage /app/frontend/dist ./public

EXPOSE 3000
CMD ["node", "server.js"]
