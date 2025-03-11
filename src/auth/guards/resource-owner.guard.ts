import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.params.id;
    const user = request.user;

    if (!user || !userId) return false;
    if (user.userType === UserType.ADMIN) return true;
    return user.id === userId;
  }
}
