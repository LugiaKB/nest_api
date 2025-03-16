import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { EntityNotFoundError } from '../common/errors/application.errors';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto = {
        name: 'Test Product',
        description: 'Test Description',
        unitPrice: 100.0,
        stock: 10,
      };

      const mockProduct = {
        id: '1',
        ...createDto,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const filters = {
        page: 1,
        limit: 10,
        name: 'test',
        minUnitPrice: 50,
        maxUnitPrice: 150,
      };

      const paginatedResponse = {
        data: [mockProduct],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      mockProductsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(filters);
      expect(result).toEqual(paginatedResponse);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle empty results', async () => {
      const emptyResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 },
      };

      mockProductsService.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll({});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        active: true,
      };

      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockProduct);
    });

    it('should return a product if found', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should handle product not found', async () => {
      mockProductsService.findOne.mockRejectedValue(
        new EntityNotFoundError('Product'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });

  describe('update', () => {
    it('should update product stock', async () => {
      const updateDto = { stock: 20 };
      const mockUpdatedProduct = {
        id: '1',
        stock: 20,
        name: 'Test Product',
      };

      mockProductsService.update.mockResolvedValue(mockUpdatedProduct);

      const result = await controller.update('1', updateDto);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should update product status', async () => {
      const updateDto = { active: false };
      mockProductsService.update.mockResolvedValue({
        id: '1',
        active: false,
      });

      const result = await controller.update('1', updateDto);
      expect(result.active).toBe(false);
    });

    it('should update multiple product fields', async () => {
      const updateDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        unitPrice: 150.0,
        stock: 20,
      };

      const updatedProduct = { ...mockProduct, ...updateDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('1', updateDto);
      expect(result).toEqual(updatedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should update product status without affecting other fields', async () => {
      const updateDto = { active: false };
      const updatedProduct = { ...mockProduct, active: false };

      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('1', updateDto);
      expect(result.active).toBe(false);
      expect(result.name).toBe(mockProduct.name);
    });
  });

  describe('remove', () => {
    it('should soft delete product successfully', async () => {
      const deletedProduct = { ...mockProduct, deletedAt: new Date() };
      mockProductsService.remove.mockResolvedValue(deletedProduct);

      const result = await controller.remove('1');
      expect(result).toHaveProperty('deletedAt');
      expect(mockProductsService.remove).toHaveBeenCalledWith('1');
    });

    it('should handle deletion of non-existent product', async () => {
      mockProductsService.remove.mockRejectedValue(
        new Error('Product not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(
        'Product not found',
      );
    });
  });
});
