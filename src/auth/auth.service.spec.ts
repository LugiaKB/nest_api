import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  UnauthorizedError,
  InvalidCredentialsError,
} from '../common/errors/application.errors';

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

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('test-token'),
  };

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
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedError when user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null as never);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw InvalidCredentialsError when password is invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(InvalidCredentialsError);
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

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(usersService, 'findByEmail')
        .mockRejectedValue(new Error('Database error'));
      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
    });

    it('should return token and user data', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        token: 'test-token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          userType: mockUser.userType,
        },
      });
    });

    it('should generate token with correct payload', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);

      await service.login(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        userType: mockUser.userType,
      });
    });

    it('should handle JWT signing errors', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT Error'));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedError);
    });
  });
});
