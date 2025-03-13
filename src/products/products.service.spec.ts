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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should apply filters correctly', async () => {
      const filters = {
        name: 'test',
        minUnitPrice: 50,
        maxUnitPrice: 150,
        active: true,
        page: 1,
        limit: 10,
      };

      const paginatedResult = {
        data: [mockProduct],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
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

  describe('update', () => {
    it('should update product status correctly', async () => {
      const updateDto = { active: false };
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.update.mockResolvedValue({
        ...mockProduct,
        active: false,
      });

      const result = await service.update('1', updateDto);
      expect(result.active).toBe(false);
    });

    it('should update multiple fields at once', async () => {
      const updateDto = {
        name: 'Updated Name',
        description: 'Updated Description',
        unitPrice: 150.0,
        stock: 20,
      };
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.update.mockResolvedValue({ ...mockProduct, ...updateDto });

      const result = await service.update('1', updateDto);
      expect(result).toEqual(expect.objectContaining(updateDto));
    });
  });
});
