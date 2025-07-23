/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { EventsGateway } from './events/events.gateway';
import { RedisModule } from './redis/redis.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
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

    const commonProxyOptions = {
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req: Request, res) => {
          if (req.body && Object.keys(req.body).length > 0) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
      },
    };

    // ---- Auth Middleware ----
    // AuthMiddleware จะทำงาน ก่อน Proxy Middleware เสมอ
    consumer.apply(AuthMiddleware).forRoutes(
      'orders', // ทุกอย่างใน /orders ต้องเช็ค Token
      'users/profile', // เฉพาะ /users/profile ที่ต้องเช็ค Token
    );

    // Proxy สำหรับ Users และ Auth Service
    consumer
      .apply(
        createProxyMiddleware({
          ...commonProxyOptions,
          target: usersServiceUrl,
          pathRewrite: {
            '^/users/auth': 'api/auth',
          },
        }),
      )
      .forRoutes('users');

    // Proxy สำหรับ Products Service
    consumer
      .apply(
        createProxyMiddleware({
          ...commonProxyOptions,
          target: ordersServiceUrl,
        }),
      )
      .forRoutes('products');

    // Proxy สำหรับ Orders Service
    consumer
      .apply(
        createProxyMiddleware({
          ...commonProxyOptions,
          target: ordersServiceUrl,
        }),
      )
      .forRoutes('orders');
  }
}
