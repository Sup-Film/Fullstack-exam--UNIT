import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  // ประกาศ url สำหรับตรวจสอบ token
  private readonly usersServiceUrl =
    'http://users-service:3002/api/auth/verify';

  async use(req: Request, res: Response, next: NextFunction) {
    // ประกาศตัวแปรสำหรับเก็บค่า token จาก header
    const token = req.cookies?.access_token;

    // ตรวจสอบว่า header มีค่า authorization หรือไม่
    if (!token) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    try {
      // ส่ง Token ไปให้ users-service ตรวจสอบ
      const response = await axios.get(this.usersServiceUrl, {
        headers: {
          Cookie: `access_token=${token}`, // 👈 ส่งต่อ Cookie ใน Header
        },
      });

      // ถ้า users-service ตอบกลับมาพร้อมข้อมูล user แสดงว่า Token ถูกต้อง
      // เราจะแนบข้อมูล user ไปกับ request เพื่อให้ส่วนอื่นใช้ต่อได้
      (req as any).user = response.data;

      // แปลงข้อมูล user เป็น JSON string และแนบไปกับ Header
      // เพื่อให้ Gateway สามารถส่งต่อไปยัง Service อื่นๆ ได้
      // (เช่น orders-service) โดยไม่ต้องตรวจสอบ Token ซ้ำอีก
      req.headers['x-user'] = JSON.stringify(response.data);; // แนบข้อมูล user ไปกับ Header

      this.logger.log(
        `✅ User authenticated: ${JSON.stringify(response.data)}`,
      );
      next(); // อนุญาตให้ request วิ่งต่อไป
    } catch (error) {
      this.logger.error('❌ Authentication failed', error.response?.data);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
