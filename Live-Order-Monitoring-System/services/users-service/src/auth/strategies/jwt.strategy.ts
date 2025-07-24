/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      // ดึง JWT token จาก Cookie ที่ชื่อว่า 'access_token'
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '', // fallback เป็น string ว่าง
    });
  }

  // Method นี้จะถูกเรียกหลังจาก JWT token ผ่านการตรวจสอบแล้ว
  async validate(payload: any) {
    // ตรวจสอบว่า user ยังมีอยู่ในระบบหรือไม่
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('ไม่พบผู้ใช้ในระบบ');
    }

    // ส่งข้อมูล user พร้อมข้อมูลจาก JWT payload
    return {
      ...user.toResponseObject(),
      tokenPayload: payload,
    };
  }
}
