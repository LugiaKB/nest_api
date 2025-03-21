import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UserType } from '@prisma/client';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    userType: UserType.CUSTOMER as UserType,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: null,
    deletedAt: null,
  };

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        userType: UserType.CUSTOMER as UserType,
      };

      jest.spyOn(service, 'create').mockResolvedValue({
        ...mockUser,
        deletedAt: null,
      });

      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(service.create as jest.Mock).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const filters: FilterUsersDto = { page: 1, limit: 10 };
      const mockPaginatedResponse = {
        data: [mockUser],
        meta: { total: 1, page: 1, limit: 10, pages: 5 },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(filters);
      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(mockUser);

      const result = await controller.remove('1');
      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findCurrentUser', () => {
    it('should return the authenticated user from request', () => {
      const { password, deletedAt, ...userWithoutSensitiveInfo } = mockUser;

      const req = {
        user: userWithoutSensitiveInfo,
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        acceptsCharsets: jest.fn(),
        acceptsEncodings: jest.fn(),
        acceptsLanguages: jest.fn(),
        param: jest.fn(),
        is: jest.fn(),
        cookies: {},
        secure: false,
        xhr: false,
        body: {},
        params: {},
        query: {},
        headers: {},
      } as unknown as RequestWithUser;

      const result = controller.findCurrentUser(req);

      expect(result).toEqual(userWithoutSensitiveInfo);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('deletedAt');
    });
  });
});
