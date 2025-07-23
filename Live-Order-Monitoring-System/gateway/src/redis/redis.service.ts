/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
// gateway/src/redis/redis.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EventsGateway } from '../events/events.gateway'; // 👈 Import EventsGateway

@Injectable()
export class RedisSubscriberService implements OnModuleInit {
  private readonly logger = new Logger(RedisSubscriberService.name);
  private subscriber: Redis;

  // 👈 Inject EventsGateway และ ConfigService เข้ามา
  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.subscriber = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });

    this.logger.log('🔗 Connecting to Redis for subscription...');

    // เริ่มดักฟัง Channel 'order_events'
    this.subscriber.subscribe('order_events', (err, count) => {
      if (err) {
        this.logger.error('❌ Failed to subscribe to Redis:', err);
        return;
      }
      this.logger.log(
        `🎧 Subscribed to ${count} channel(s). Listening for messages...`,
      );
    });

    // เมื่อมีข้อความใหม่เข้ามาใน channel 'order_events' จะเรียก callback นี้
    this.subscriber.on('message', (channel, message) => {
      // log ว่าได้รับข้อความจาก channel ไหน
      this.logger.log(`📩 Received message from channel '${channel}'`);
      // ส่งข้อความไปให้ handleOrderEvent เพื่อประมวลผล
      this.handleOrderEvent(message);
    });
  }

  private handleOrderEvent(message: string) {
    try {
      // แปลงข้อความที่รับมาจาก Redis เป็น object
      const event = JSON.parse(message);

      // ถ้า event เป็น order_created ให้ broadcast ไปยัง frontend
      if (event.event === 'order_created') {
        this.eventsGateway.broadcastNewOrder(event.data);
      }
      // ถ้า event เป็น order_status_updated ให้ broadcast สถานะใหม่ไปยัง frontend
      else if (event.event === 'order_status_updated') {
        this.eventsGateway.broadcastOrderStatusUpdate(event.data);
      }
    } catch (error) {
      // ถ้าแปลงข้อความไม่ได้ (JSON error) ให้ log error
      this.logger.error('❌ Could not parse message from Redis', error);
    }
  }
}
