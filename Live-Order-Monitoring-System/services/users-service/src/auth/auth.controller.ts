/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);

      return {
        success: true,
        message: 'ล็อกอินสำเร็จ',
        data: result,
      };
    } catch (error) {
      console.error(`${loginDto.email} - ${error.message}`);

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

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.authService.register(createUserDto);

      return {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ',
        data: result,
      };
    } catch (error) {
      console.error(`${createUserDto.email} - ${error.message}`);

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

  @Post('verify')
  async verifyToken(@Body('token') token: string) {
    try {
      const result = await this.authService.verifyToken(token);

      return {
        success: true,
        message: 'Token is valid',
        data: result,
      };
    } catch (error) {
      console.error(`Token verification failed - ${error.message}`);

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
