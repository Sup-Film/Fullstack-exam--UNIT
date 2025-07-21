// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // import UserModule เพื่อให้ AuthService สามารถใช้ UserService ได้
    UserModule,

    // ติดตั้งและกำหนดค่า JWT Module
    JwtModule.register({
      // secret key สำหรับเข้ารหัส token (ในระบบจริงต้องเก็บใน environment variable)
      secret: process.env.JWT_SECRET || 'your-development-secret-key',
      signOptions: {
        expiresIn: '24h', // token หมดอายุใน 24 ชั่วโมง
        issuer: 'users-service', // ระบุว่า token มาจาก users-service
        algorithm: 'HS256', // algorithm ที่ใช้เข้ารหัส
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // export เผื่อ module อื่นต้องการใช้
})
export class AuthModule {}
