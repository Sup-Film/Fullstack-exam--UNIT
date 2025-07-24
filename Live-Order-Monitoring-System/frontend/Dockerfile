# Base Image
FROM node:20-alpine
# Working Directory
WORKDIR /app
# Copy & Install dependencies
#    เราติดตั้งแค่ dependencies ก่อน เพื่อใช้ประโยชน์จาก Docker cache
COPY package*.json ./
RUN npm install
# Copy the rest of the source code
COPY . .
# Expose the Next.js development port
EXPOSE 3000
# The command to start the development server
#    ใช้ "npm run dev" แทน "npm start"
CMD ["npm", "run", "dev"]