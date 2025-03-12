import { Product as PrismaProduct } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class Product implements PrismaProduct {
  id: string;
  name: string;
  description: string;
  unitPrice: Decimal;
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  //   OrderItems: OrderItem[];
}
