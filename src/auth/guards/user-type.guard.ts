import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { ForbiddenError } from '../../common/errors/application.errors';

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

    if (!allowedTypes.includes(userType)) {
      throw new ForbiddenError();
    }

    return true;
  }
}
