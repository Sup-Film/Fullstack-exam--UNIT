FROM node:20-alpine
# Working Directory: กำหนดให้ทำงานในโฟลเดอร์ /app ภายใน container
WORKDIR /app
# Copy dependencies: คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./
# Install dependencies: ติดตั้ง dependencies ทั้งหมดอย่างรวดเร็วและแม่นยำ
RUN npm ci
# Copy source code: คัดลอกโค้ดทั้งหมดของ service เข้าไปใน container
COPY . .
# Build application: คอมไพล์ TypeScript เป็น JavaScript
RUN npm run build
# Expose port: บอก Docker ว่า service นี้จะทำงานที่ port 3001
EXPOSE 3001
# Start command: คำสั่งที่จะรันเมื่อ container เริ่มทำงาน
CMD ["npm", "run", "start"]