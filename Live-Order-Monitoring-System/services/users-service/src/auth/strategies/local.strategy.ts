import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // ใช้ email แทน username (default ของ passport-local คือ username)
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  // Method นี้จะถูกเรียกโดย Passport เมื่อมีการ login
  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    return user; // ส่ง user object ไปยัง controller
  }
}
