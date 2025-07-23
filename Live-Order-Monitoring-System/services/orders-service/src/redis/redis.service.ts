import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Order } from 'src/entities/order.entity';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  // ประกาศตัวแปร Redis สำหรับ publisher เพื่อใช้ในการส่งข้อความ
  // ใช้ ioredis เพื่อเชื่อมต่อกับ Redis server
  private publisher: Redis;

  constructor(private configService: ConfigService) {
    // สร้าง instance ของ Redis โดยกำหนด host และ port จาก config
    this.publisher = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'redis'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });

    // เมื่อเชื่อมต่อสำเร็จหรือเกิดข้อผิดพลาด จะมีการ log ข้อมูล
    this.publisher.on('connect', () => {
      this.logger.log('Connected to Redis server');
    });
    this.publisher.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  // ส่ง Event 'order_created' ไปยัง Channel 'order_events'
  // รับข้อมูล order ที่ถูกสร้างขึ้นใหม่ order: Order
  async publishOrderCreated(order: Order): Promise<void> {
    // ประกาศตัวแปร message เป็น JSON string ที่ประกอบด้วย event name และข้อมูล order
    const message = JSON.stringify({
      event: 'order_created',
      data: order,
    });

    // ใช้ publisher.publish เพื่อส่งข้อความไปยัง channel 'order_events' พร้อมกับ message ที่สร้างขึ้น
    await this.publisher.publish('order_events', message);
    this.logger.log(`Published order created event for order ID: ${order.id}`);
  }

  // ส่ง Event 'order_status_updated' ไปยัง Channel 'order_events'
  // รับข้อมูล order ที่มีการเปลี่ยนแปลงสถานะ order: Order
  async publishOrderStatusChanged(order: Order): Promise<void> {
    const message = JSON.stringify({
      event: 'order_status_updated',
      data: order,
    });

    await this.publisher.publish('order_events', message);
    this.logger.log(
      `Published order status updated event for order ID: ${order.id}`,
    );
  }

  // ปิดการเชื่อมต่อ Redis เมื่อ Service ถูกทำลาย
  async onModuleDestroy() {
    await this.publisher.quit();
    this.logger.log('👋 Redis connection closed.');
  }
}
