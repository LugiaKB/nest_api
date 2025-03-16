import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EntityNotFoundError } from '../common/errors/application.errors';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    userType: UserType.CUSTOMER as UserType,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    });

    it('should create a user successfully', async () => {
      const createDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        userType: UserType.CUSTOMER,
      };

      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);
      expect(result).toEqual(mockUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        password: 'hashedPassword',
      });
    });
  });

  describe('findAll', () => {
    const filters = {
      page: 1,
      limit: 10,
      name: 'test',
    };

    const mockPaginatedResponse = {
      data: [mockUser],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      },
    };

    it('should return paginated users', async () => {
      mockRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await service.findAll(filters);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return paginated users with filters', async () => {
      const filters = {
        name: 'test',
        email: 'test@example.com',
        userType: UserType.ADMIN,
        page: 1,
        limit: 10,
      };

      const paginatedResult = {
        data: [mockUser],
        meta: { total: 1, page: 1, limit: 10, pages: 1 },
      };

      mockRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll(filters);
      expect(result).toEqual(paginatedResult);
      expect(repository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle empty results', async () => {
      const emptyResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 },
      };

      mockRepository.findAll.mockResolvedValue(emptyResult);

      const result = await service.findAll({});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw EntityNotFoundError if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(EntityNotFoundError);
    });

    it('should throw EntityNotFoundError if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated Name' };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.update).toHaveBeenCalledWith('1', updatedUser);
    });

    it('should throw EntityNotFoundError if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        EntityNotFoundError,
      );
    });

    it('should not hash password if not provided', async () => {
      const updateDto = { name: 'Updated Name' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ ...mockUser, ...updateDto });

      (bcrypt.hash as jest.Mock).mockClear();

      await service.update('1', updateDto);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.softDelete.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.remove('1');

      expect(result).toHaveProperty('deletedAt');
      expect(mockRepository.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw EntityNotFoundError if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(EntityNotFoundError);
    });
  });
});
