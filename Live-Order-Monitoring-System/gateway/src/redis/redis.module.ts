// gateway/src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisSubscriberService } from './redis.service';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [EventsModule],
  providers: [RedisSubscriberService],
})
export class RedisModule {}
