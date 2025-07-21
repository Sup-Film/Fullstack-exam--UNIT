import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/loginReponse.dto';
import { CreateUserDto } from 'src/user/dto/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // ค้นหาผู้ใช้จากอีเมล
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    // สร้าง JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    // สร้าง token ด้วย jwtService
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: user.toResponseObject(),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<LoginResponseDto> {
    const newUser = await this.userService.create(createUserDto);

    return this.login({
      email: newUser.email,
      password: createUserDto.password, // ใช้รหัสผ่านที่สร้างใหม่
    });
  }

  async verifyToken(token: string) {
    try {
      // ถอดรหัส JWT token และตรวจสอบความถูกต้อง
      const payload = this.jwtService.verify(token);
      // หาผู้ใช้ปัจจุบันเพื่อให้แน่ใจว่ายังมีอยู่ในระบบ
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('ไม่พบผู้ใช้ในระบบ');
      }

      return {
        valid: true,
        user: user.toResponseObject(),
        payload,
      };
    } catch (error) {
      console.log(`❌ การตรวจสอบ token ล้มเหลว: ${error.message}`);
      throw new UnauthorizedException('Token ไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  }
}
