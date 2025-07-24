// services/orders-service/src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user; // userPayload คือ { valid: true, user: {...} }

    // 👇 **นี่คือส่วนที่แก้ไขให้ถูกต้อง**
    // 1. ดึง "user" object ที่แท้จริงออกมาจาก object ที่ถูกห่อไว้
    const actualUser = userPayload?.user;

    // 2. ตรวจสอบว่ามี user และ role อยู่จริงหรือไม่
    if (!actualUser || !actualUser.role) {
      this.logger.warn('User or role not found in payload');
      return false;
    }

    // 3. ตรวจสอบ role จาก actualUser.role
    const hasPermission = requiredRoles.includes(actualUser.role);
    this.logger.debug(
      `Permission for role '${actualUser.role}': ${hasPermission}`,
    );

    return hasPermission;
  }
}
