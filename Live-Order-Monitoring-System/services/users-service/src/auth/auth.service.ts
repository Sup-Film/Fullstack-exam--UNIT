// src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginResponseDto } from './dto/loginReponse.dto';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Method สำหรับ LocalStrategy - ตรวจสอบ credentials
   * ใช้โดย Passport LocalStrategy เพื่อ validate email และ password
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    this.logger.log(`🔐 Validating credentials for: ${email}`);

    try {
      // หาผู้ใช้จาก email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        this.logger.warn(`❌ User not found: ${email}`);
        return null;
      }

      // ตรวจสอบรหัสผ่าน
      const isPasswordValid = await this.userService.validatePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`❌ Invalid password for: ${email}`);
        return null;
      }

      this.logger.log(`✅ User validation successful: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`❌ User validation error:`, error);
      return null;
    }
  }

  /**
   * สร้าง JWT token และ response - ใช้หลังจาก authentication สำเร็จ
   * Method นี้รับ User entity และสร้าง JWT token พร้อม response ที่สมบูรณ์
   */
  async login(user: User): Promise<LoginResponseDto> {
    this.logger.log(`🔑 Generating JWT token for: ${user.email}`);

    // สร้าง JWT payload ด้วยข้อมูลที่จำเป็น
    const payload = {
      sub: user.id, // Subject - รหัสผู้ใช้
      email: user.email, // อีเมลผู้ใช้
      name: user.name, // ชื่อผู้ใช้
      role: user.role, // บทบาท - สำคัญสำหรับ authorization
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    };

    // เข้ารหัสและสร้าง JWT token
    const access_token = this.jwtService.sign(payload);

    this.logger.log(`✅ JWT token generated successfully for: ${user.email}`);

    return {
      access_token,
      user: user.toResponseObject(), // ใช้ method ใน entity เพื่อซ่อนรหัสผ่าน
    };
  }

  /**
   * สมัครสมาชิกใหม่ - สร้างผู้ใช้แล้วให้เข้าสู่ระบบทันที
   * Method นี้จะสร้างผู้ใช้ใหม่แล้วทำการ login ให้อัตโนมัติ
   */
  async register(createUserDto: CreateUserDto): Promise<LoginResponseDto> {
    this.logger.log(`📝 Registering new user: ${createUserDto.email}`);

    try {
      // สร้างผู้ใช้ใหม่
      const newUser = await this.userService.create(createUserDto);

      this.logger.log(`✅ User registration successful: ${newUser.email}`);

      // ให้ผู้ใช้ใหม่เข้าสู่ระบบทันทีโดยไม่ต้องกรอกรหัสผ่านอีกครั้ง
      return this.login(newUser);
    } catch (error) {
      this.logger.error(
        `❌ User registration failed: ${createUserDto.email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * ตรวจสอบ JWT token สำหรับ external services
   * ใช้เมื่อ Orders Service หรือ Gateway ต้องการตรวจสอบ token
   */
  async verifyToken(token: string) {
    this.logger.log('🔍 Verifying external token...');

    try {
      // ถอดรหัสและตรวจสอบ JWT token
      const payload = this.jwtService.verify(token);

      // หาผู้ใช้ปัจจุบันเพื่อให้แน่ใจว่ายังมีอยู่ในระบบ
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('ไม่พบผู้ใช้ในระบบ');
      }

      this.logger.log(
        `✅ External token verification successful for: ${user.email}`,
      );

      return {
        valid: true,
        user: user.toResponseObject(),
        payload,
      };
    } catch (error) {
      this.logger.error(
        `❌ External token verification failed:`,
        error.message,
      );
      throw new UnauthorizedException('Token ไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  }
}
