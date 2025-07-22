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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginResponseDto } from './dto/loginReponse.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // ✨ กำหนดให้ endpoint นี้ตอบกลับ 200 OK เมื่อสำเร็จ
  async login(@Request() req): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<LoginResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body('token') token: string) {
    return this.authService.verifyToken(token);
  }
}
