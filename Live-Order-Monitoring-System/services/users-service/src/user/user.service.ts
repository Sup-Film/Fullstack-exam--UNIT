import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // สร้างผู้ใช้ใหม่
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // เข้ารหัสผ่านก่อนบันทึก
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    return await this.usersRepository.save(user);
  }

  // หาผู้ใช้จากอีเมล
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // หาผู้ใช้จาก ID - ใช้ในการตรวจสอบ token
  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  // ตรวจสอบรหัสผ่าน - เปรียบเทียบรหัสผ่านที่ป้อนกับที่เก็บในฐานข้อมูล
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
