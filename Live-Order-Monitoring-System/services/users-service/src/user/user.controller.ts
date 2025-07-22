import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /user/profile
  @Get('profile')
  @UseGuards(JwtAuthGuard) // ป้องกันด้วย JWT Guard
  async getProfile(@Request() req: any) {
    return {
      success: true,
      message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
      data: req.user,
    };
  }

  // GET /user/all
  @Get('all')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAllUsers() {
    return this.userService.findAll(); // สมมติว่า userService มี method findAll()
  }
}
