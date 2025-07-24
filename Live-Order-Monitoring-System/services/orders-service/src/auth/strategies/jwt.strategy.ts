/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

// Strategy นี้จะทำหน้าที่ 'อ่าน' ข้อมูล user จาก Header ที่ Gateway ส่งต่อมาให้
// ไม่ได้ทำการ 'verify' token จริงๆ เพราะเราเชื่อใจ Gateway ที่ทำหน้าที่นั้นไปแล้ว
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // บอกให้ Strategy ดึงข้อมูล user จาก custom header ที่เราจะให้ Gateway ส่งมา
      jwtFromRequest: ExtractJwt.fromHeader('x-user'),
      ignoreExpiration: true, // เราไม่สนวันหมดอายุ เพราะ Gateway ตรวจมาแล้ว
      secretOrKey: 'dummySecret', // ใส่ค่าอะไรก็ได้ เพราะเราจะไม่ verify token
    });
  }

  // ฟังก์ชันนี้จะทำงานหลังจาก jwtFromRequest ดึงข้อมูลสำเร็จ
  async validate(payload: any) {
    // payload ที่ได้จาก header จะเป็น string, เราต้อง parse กลับเป็น object
    try {
      const user = JSON.parse(payload);
      return user; // คืนค่า user object กลับไป
    } catch (e) {
      throw new UnauthorizedException('Invalid user data in header');
    }
  }
}
