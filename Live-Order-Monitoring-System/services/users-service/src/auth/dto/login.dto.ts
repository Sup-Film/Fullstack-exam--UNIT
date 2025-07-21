/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'กรุณาใส่อีเมลให้ถูกต้อง' })
  email: string;

  @IsString()
  password: string;
}
