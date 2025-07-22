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
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';

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

  @Get('profile')
  @UseGuards(JwtAuthGuard) // ใช้ Guard ที่เราสร้างขึ้น
  getProfile(@Request() req: any) {
    // req.user จะมีข้อมูลผู้ใช้ที่ JwtStrategy ส่งมาให้
    return {
      success: true,
      message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
      data: req.user,
    };
  }

  // กำหนด Route เฉพาะ Role admin
  @Get('all')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAllUsers() {
    return {
      message: 'This route is protected and only accessible by admin users.',
    };
  }

  /**
   * ตรวจสอบ token สำหรับ external services
   * ไม่ใช้ Guard เพราะรับ token ผ่าน request body
   */
  @Post('verify')
  async verifyToken(@Body('token') token: string) {
    try {
      this.logger.log('🔍 Processing external token verification...');

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
