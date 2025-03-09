import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const ROLES_KEY = 'userTypes';
export const AllowedUserTypes = (...types: UserType[]) =>
  SetMetadata(ROLES_KEY, types);

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedTypes = this.reflector.get<UserType[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!allowedTypes) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userType = request.user?.userType;

    if (!userType) {
      return false;
    }

    return allowedTypes.includes(userType);
  }
}
