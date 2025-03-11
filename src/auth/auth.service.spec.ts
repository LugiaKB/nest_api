import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    userType: UserType.CUSTOMER as UserType,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } satisfies User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null as never);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user when credentials are valid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'correctpassword',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
    });

    it('should return access token and user data', async () => {
      const signSpy = jest.spyOn(jwtService, 'sign');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        access_token: 'test-token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          userType: mockUser.userType,
        },
      });

      expect(signSpy).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        userType: mockUser.userType,
      });
    });
  });
});
