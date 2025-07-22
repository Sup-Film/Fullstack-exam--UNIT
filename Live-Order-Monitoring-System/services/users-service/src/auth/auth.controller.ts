/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      this.logger.log(`🔐 Processing login for: ${req.user.email}`);

      // req.user มาจาก LocalStrategy validation แล้ว
      // ส่งต่อให้ AuthService เพื่อสร้าง JWT token
      const result = await this.authService.login(req.user);

      this.logger.log(`✅ Login successful: ${req.user.email}`);

      return {
        success: true,
        message: 'ล็อกอินสำเร็จ',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `❌ Login processing failed: ${req.user?.email}`,
        error,
      );

      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'LOGIN_FAILED',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * สมัครสมาชิก - ไม่ต้องการ authentication
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log(`📝 Processing registration for: ${createUserDto.email}`);

      // เรียกใช้ AuthService เพื่อสมัครสมาชิก
      const result = await this.authService.register(createUserDto);

      this.logger.log(`✅ Registration successful: ${createUserDto.email}`);

      return {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `❌ Registration failed: ${createUserDto.email}`,
        error,
      );

      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'REGISTRATION_FAILED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ตรวจสอบ token สำหรับ external services
   * ไม่ใช้ Guard เพราะรับ token ผ่าน request body
   */
  @Post('verify')
  async verifyToken(@Body('token') token: string) {
    try {
      this.logger.log('🔍 Processing external token verification...');

      // เรียกใช้ AuthService เพื่อตรวจสอบ token
      const result = await this.authService.verifyToken(token);

      this.logger.log('✅ External token verification successful');

      return {
        success: true,
        message: 'Token is valid',
        data: result,
      };
    } catch (error) {
      this.logger.error('❌ External token verification failed:', error);

      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'TOKEN_VERIFICATION_FAILED',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
