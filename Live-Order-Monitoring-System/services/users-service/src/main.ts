/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins
  // กำหนดให้สามารถเข้าถึง API ได้จาก origin ที่ระบุในที่นี้คือ gateway
  app.enableCors({
    origin: [
      'http://localhost:3000', // Gateway URL
      'http://gateway:3000', // Gateway URL ใน Docker network
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation pipe
  // เป็นการเช็คข้อมูลที่เข้ามาใน request ว่าตรงตามที่เรากำหนดไว้ใน DTO หรือไม่
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // เอาแค่ field ที่เราอนุญาตเท่านั้น
      forbidNonWhitelisted: true, // ปฏิเสธถ้ามี field แปลกๆ เข้ามา
      transform: true, // แปลงข้อมูลให้เป็นประเภทที่ต้องการอัตโนมัติ
      disableErrorMessages: false, // แสดงข้อความผิดพลาดเมื่อ validation ไม่ผ่าน
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
