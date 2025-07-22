import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ดึงค่า roles ที่กำหนดไว้ใน Decorator @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // ถ้า Route นี้ไม่ได้กำหนด Role ก็อนุญาตให้ผ่านได้เลย
    if (!requiredRoles) {
      return true;
    }

    // ดึงข้อมูล user จาก request (ซึ่งถูกใส่เข้ามาโดย JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // ตรวจสอบว่า user มี role ตรงกับที่ Routeต้องการหรือไม่
    return requiredRoles.includes(user.role);
  }
}
