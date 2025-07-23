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
  private readonly usersServiceUrl = 'http://users-service:3002/api/auth/verify';

  async use(req: Request, res: Response, next: NextFunction) {
    // ประกาศตัวแปรสำหรับเก็บค่า token จาก header
    const authHeader = req.headers.authorization;

    // ตรวจสอบว่า header มีค่า authorization หรือไม่
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    // ดึง token จาก header
    const token = authHeader.split(' ')[1];

    try {
      // ส่ง Token ไปให้ users-service ตรวจสอบ
      const response = await axios.get(this.usersServiceUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ถ้า users-service ตอบกลับมาพร้อมข้อมูล user แสดงว่า Token ถูกต้อง
      // เราจะแนบข้อมูล user ไปกับ request เพื่อให้ส่วนอื่นใช้ต่อได้
      (req as any).user = response.data;

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
