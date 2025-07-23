import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})

// Implement NestModule เพื่อให้สามารถใช้ Middleware ได้
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    // ---- Proxy Middleware ----
    // ดึง URL ของ Service ปลายทางมาจาก .env
    const usersServiceUrl = this.configService.get<string>('USERS_SERVICE_URL');
    const ordersServiceUrl =
      this.configService.get<string>('ORDERS_SERVICE_URL');

    // สร้าง Proxy สำหรับ Auth Service
    consumer
      .apply(
        createProxyMiddleware({
          target: usersServiceUrl,
          changeOrigin: true,
        }),
      )
      .forRoutes('auth'); // ทุก path ที่ขึ้นต้นด้วย /auth

    // สร้าง Proxy สำหรับ Users Service
    consumer
      .apply(
        createProxyMiddleware({
          target: usersServiceUrl,
          changeOrigin: true,
        }),
      )
      .forRoutes('users'); // ทุก path ที่ขึ้นต้นด้วย /users

    // สร้าง Proxy สำหรับ Orders Service
    consumer
      .apply(
        createProxyMiddleware({
          target: ordersServiceUrl,
          changeOrigin: true,
        }),
      )
      .forRoutes('orders'); // ทุก path ที่ขึ้นต้นด้วย /orders

    // ---- Auth Middleware ----
    // AuthMiddleware จะทำงาน ก่อน Proxy Middleware เสมอ
    consumer.apply(AuthMiddleware).forRoutes(
      'orders', // ทุกอย่างใน /orders ต้องเช็ค Token
      'users/profile', // เฉพาะ /users/profile ที่ต้องเช็ค Token
      // ส่วน /users (สำหรับ register) และ /auth/login จะไม่ถูกเช็ค
    );
  }
}
