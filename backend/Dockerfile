FROM node:20-slim
WORKDIR /app

# Copy package files first: Docker caches this layer,
# so npm install only re-runs when dependencies change
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000
CMD ["node", "src/server.js"]