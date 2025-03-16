import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { EntityNotFoundError } from '../common/errors/application.errors';
import { Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    unitPrice: new Decimal(100.0),
    stock: 10,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto = {
        name: 'Test Product',
        description: 'Test Description',
        unitPrice: 100.0,
        stock: 10,
      };

      mockRepository.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);
      expect(result).toEqual(mockProduct);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should apply price range filters correctly', async () => {
      const filters = {
        minUnitPrice: 50,
        maxUnitPrice: 150,
        page: 1,
        limit: 10,
      };

      const paginatedResult = {
        data: [mockProduct],
        meta: { total: 1, page: 1, limit: 10, pages: 1 },
      };

      mockRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll(filters);
      expect(result).toEqual(paginatedResult);
      expect(repository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should filter by active status', async () => {
      const filters = { active: true };
      await service.findAll(filters);
      expect(repository.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw EntityNotFoundError if product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('update', () => {
    it('should update product price and recalculate stock', async () => {
      const updateDto = { unitPrice: 150.0, stock: 20 };
      const updatedProduct = {
        ...mockProduct,
        unitPrice: new Decimal(150.0),
        stock: 20,
      };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateDto);
      expect(result.unitPrice.toNumber()).toBe(150.0);
      expect(result.stock).toBe(20);
    });

    it('should handle product deactivation', async () => {
      const updateDto = { active: false };
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.update.mockResolvedValue({
        ...mockProduct,
        active: false,
      });

      const result = await service.update('1', updateDto);
      expect(result.active).toBe(false);
    });
  });

  describe('remove', () => {
    it('should soft delete product', async () => {
      const deletedAt = new Date();
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.softDelete.mockResolvedValue({
        ...mockProduct,
        deletedAt,
      });

      const result = await service.remove('1');
      expect(result.deletedAt).toEqual(deletedAt);
    });

    it('should throw EntityNotFoundError when trying to delete non-existent product', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(EntityNotFoundError);
    });
  });
});
