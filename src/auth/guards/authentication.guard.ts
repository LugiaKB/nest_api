import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedError } from '../../common/errors/application.errors';

@Injectable()
export class AuthenticationGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const canActivate = await super.canActivate(context);
      return canActivate as boolean;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedError(error.message);
      }
      throw new UnauthorizedError();
    }
  }
}
