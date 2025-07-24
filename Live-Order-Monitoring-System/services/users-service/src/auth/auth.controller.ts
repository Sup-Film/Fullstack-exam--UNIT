/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginResponseDto } from './dto/loginReponse.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginCookieResponseDto } from './dto/loginCookieResponse.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // ✨ กำหนดให้ endpoint นี้ตอบกลับ 200 OK เมื่อสำเร็จ
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginCookieResponseDto> {
    // LocalAuthGuard จะตรวจสอบ email และ password จาก request body
    const loginData = await this.authService.login(req.user);

    // ตั้งค่า cookie สำหรับ JWT token
    res.cookie('access_token', loginData.access_token, {
      httpOnly: true, // ป้องกันการเข้าถึงจาก JavaScript
      secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ใน Production
      sameSite: 'strict', // ป้องกัน CSRF
      path: '/', // Cookie ใช้งานได้ทั้งเว็บ
      expires: new Date(Date.now() + 3600 * 1000), // หมดอายุใน 1 ชั่วโมง
    });

    // ส่งข้อมูลการเข้าสู่ระบบกลับไป
    return { user: loginData.user };
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<LoginResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Request() req) {
    // JwtAuthGuard จะอ่าน token จาก Authorization Header อัตโนมัติ
    // และแนบ user data เข้าใน req.user
    return {
      valid: true,
      user: req.user, // user data ที่ได้จาก JWT Guard
    };
  }
}
