/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  ADMIN = 'admin',
}

@Entity('user') // ชื่อของตารางในฐานข้อมูล
export class User {
  @PrimaryGeneratedColumn() // สร้าง Primary Key อัตโนมัติ
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // จะเก็บในรูป hash เสมอ

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  // ซ่อนรหัสผ่านเมื่อส่งข้อมูลออกไป
  toResponseObject() {
    const { password, ...result } = this;
    return result;
  }
}
