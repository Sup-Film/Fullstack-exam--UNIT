import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserFromHeaderGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userHeader = request.headers['x-user'];

    if (!userHeader) {
      throw new UnauthorizedException('Missing user information header');
    }

    try {
      // แปลง JSON string จาก header กลับเป็น object
      const user = JSON.parse(userHeader as string);
      // แนบ user object ที่สมบูรณ์ไปกับ request
      request.user = user;
      return true; // อนุญาตให้ผ่าน
    } catch (error) {
      throw new UnauthorizedException('Invalid user information in header');
    }
  }
}
