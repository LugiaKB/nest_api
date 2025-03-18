import { Request } from 'express';
import { UserWithoutSensitiveInfo } from 'src/users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserWithoutSensitiveInfo;
}
