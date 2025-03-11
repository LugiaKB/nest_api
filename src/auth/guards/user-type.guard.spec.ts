import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { UserTypeGuard, AllowedUserTypes, ROLES_KEY } from './user-type.guard';
import { createMock } from '@golevelup/ts-jest';

describe('UserTypeGuard', () => {
  let guard: UserTypeGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserTypeGuard(reflector);
    mockContext = createMock<ExecutionContext>();
  });

  describe('canActivate', () => {
    it('should allow access when no user types are required', () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has required type', () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => [UserType.ADMIN]);
      jest
        .spyOn(mockContext.switchToHttp(), 'getRequest')
        .mockImplementation(() => ({
          user: { userType: UserType.ADMIN },
        }));

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user has wrong type', () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => [UserType.ADMIN]);
      jest
        .spyOn(mockContext.switchToHttp(), 'getRequest')
        .mockImplementation(() => ({
          user: { userType: UserType.CUSTOMER as UserType },
        }));

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should deny access when user is not present', () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => [UserType.ADMIN]);
      jest
        .spyOn(mockContext.switchToHttp(), 'getRequest')
        .mockImplementation(() => ({
          user: undefined,
        }));

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });

  describe('AllowedUserTypes decorator', () => {
    it('should set metadata with provided user types', () => {
      class TestController {
        @AllowedUserTypes(UserType.ADMIN)
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestController.prototype.testMethod,
      ) as UserType[];

      expect(metadata).toEqual([UserType.ADMIN]);
    });
  });
});
