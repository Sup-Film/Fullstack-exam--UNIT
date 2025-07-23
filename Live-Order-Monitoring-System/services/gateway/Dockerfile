FROM node:20-alpine
# Working Directory
WORKDIR /app
# Copy & Install dependencies
COPY package*.json ./
RUN npm ci
# Copy source code
COPY . .
# Build application
RUN npm run build
# Expose port (Port หลักของโปรเจกต์)
EXPOSE 3000
# Start command
CMD ["npm", "run", "start"]