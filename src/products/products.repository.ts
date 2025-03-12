import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Product, Prisma } from '@prisma/client';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findAll(filters: FilterProductsDto) {
    const {
      page = 1,
      limit = 10,
      name,
      minUnitPrice,
      maxUnitPrice,
      active,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(active !== undefined && { active }),
      ...((minUnitPrice !== undefined || maxUnitPrice !== undefined) && {
        unitPrice: {
          ...(minUnitPrice !== undefined && { gte: minUnitPrice }),
          ...(maxUnitPrice !== undefined && { lte: maxUnitPrice }),
        },
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
