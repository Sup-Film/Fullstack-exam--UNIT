// src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginResponseDto } from './dto/loginReponse.dto';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { User } from '../user/entities/user.entity';
import { RegisterResponseDto } from './dto/regusterReponse.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials for Passport's LocalStrategy.
   * @returns The user object if valid, otherwise null.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    if (
      user &&
      (await this.userService.validatePassword(password, user.password))
    ) {
      // ไม่จำเป็นต้อง log ทุกขั้นตอน เพราะ LocalStrategy จะจัดการ error ให้
      // การ log เยอะเกินไปอาจทำให้ log ไม่สะอาด (log noise)
      return user;
    }
    return null;
  }

  /**
   * Generates a JWT for an authenticated user.
   */
  async login(user: User): Promise<LoginResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} logged in successfully.`);

    return {
      access_token: accessToken,
      user: user.toResponseObject(),
    };
  }

  /**
   * Registers a new user and logs them in.
   * @throws {ConflictException} If the email already exists.
   */
  async register(createUserDto: CreateUserDto): Promise<RegisterResponseDto> {
    try {
      const newUser = await this.userService.create(createUserDto);
      this.logger.log(`New user registered: ${newUser.email}`);
      return {
        user: newUser.toResponseObject(),
      };
    } catch (error) {
      this.logger.error(
        `Registration failed for ${createUserDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verifies a JWT for inter-service communication.
   * @throws {UnauthorizedException} If the token is invalid or expired.
   */
  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User in token not found');
      }

      return { valid: true, user: user.toResponseObject() };
    } catch (error) {
      // ✨ try...catch ที่นี่สำคัญมาก
      // เพื่อแปลง error จาก jwt (เช่น TokenExpiredError)
      // ให้เป็น UnauthorizedException ที่ Client เข้าใจง่าย
      this.logger.warn(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }
}
