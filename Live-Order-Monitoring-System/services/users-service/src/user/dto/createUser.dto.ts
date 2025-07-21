import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  // การตรวจสอบอีเมลว่าต้องเป็นรูปแบบอีเมลที่ถูกต้อง
  @IsEmail({}, { message: 'กรุณาใส่อีเมลให้ถูกต้อง' })
  email: string;

  // การตรวจสอบรหัสผ่านว่าต้องเป็นข้อความและมีความยาวเหมาะสม
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  @MaxLength(50, { message: 'รหัสผ่านต้องไม่เกิน 50 ตัวอักษร' })
  password: string;

  // การตรวจสอบชื่อ
  @IsString({ message: 'ชื่อต้องเป็นข้อความ' })
  @MinLength(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  @MaxLength(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' })
  name: string;
}
