// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // โหลดไฟล์ .env และทำให้ ConfigService ใช้งานได้ทั่วทั้งแอป
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ตั้งค่าการเชื่อมต่อฐานข้อมูลแบบ Async
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Product, Order, OrderItem], // ลงทะเบียน Entity ทั้งหมด
        synchronize: true, // true เฉพาะใน development เท่านั้น
        logging: true,
      }),
      inject: [ConfigService],
    }),

    // นำเข้า ProductsModule ที่เราสร้างไว้
    RedisModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
