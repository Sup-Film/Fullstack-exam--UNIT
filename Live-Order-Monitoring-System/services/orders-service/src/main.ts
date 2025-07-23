// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>('PORT', 3001);

  app.setGlobalPrefix('api');

  // เปิดใช้งาน Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // แปลง DTO ให้อัตโนมัติ
      whitelist: true, // ตัด property ที่ไม่มีใน DTO ทิ้ง
      forbidNonWhitelisted: true, // แจ้งเตือนถ้ามี property แปลกปลอม
    }),
  );

  // เปิดใช้งาน CORS
  app.enableCors();

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Orders Service is running on http://localhost:${port}/api`);
}

bootstrap();
