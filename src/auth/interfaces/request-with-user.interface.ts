import { Request } from 'express';
import { User } from '@prisma/client';

type UserWithoutSensitiveInfo = Omit<User, 'password' | 'deletedAt'>;

export interface RequestWithUser extends Request {
  user: UserWithoutSensitiveInfo;
}
