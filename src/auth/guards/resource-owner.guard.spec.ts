import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { ResourceOwnerGuard } from './resource-owner.guard';

describe('ResourceOwnerGuard', () => {
  let guard: ResourceOwnerGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ResourceOwnerGuard(reflector);
  });

  const createMockContext = (
    user: { id: string; userType: UserType } | null,
    params: { id: string },
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params,
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    }) as ExecutionContext;

  it('should allow access for admin users', () => {
    const context = createMockContext(
      { id: '1', userType: UserType.ADMIN },
      { id: '2' },
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access for users accessing their own resource', () => {
    const userId = '1';
    const context = createMockContext(
      { id: userId, userType: UserType.CUSTOMER as UserType },
      { id: userId },
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access for non-admin users accessing other resources', () => {
    const context = createMockContext(
      { id: '1', userType: UserType.CUSTOMER as UserType },
      { id: '2' },
    );

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user is not present', () => {
    const context = createMockContext(null, { id: '1' });

    expect(guard.canActivate(context)).toBe(false);
  });
});
