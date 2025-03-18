import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithUser(
    customerData: CreateCustomerDto,
    userData: CreateUserDto,
  ): Promise<User> {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userData,
      });

      await tx.customer.create({
        data: {
          ...customerData,
          userId: user.id,
        },
      });

      return tx.user.findUnique({
        where: { id: user.id },
        include: { customer: true },
      });
    });

    if (!result || !result.customer) {
      throw new Error('Failed to create customer with user');
    }

    return {
      ...result,
      customer: result.customer,
    } as User;
  }

  async findOne(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        customer: true,
      },
    });
  }

  async updateWithUser(
    userId: string,
    customerData: UpdateCustomerDto,
    userData: UpdateUserDto,
  ): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: userData,
      });

      const customer = await tx.customer.update({
        where: { userId },
        data: customerData,
      });

      return {
        ...user,
        customer,
      } satisfies User;
    });
  }

  async softDelete(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
      include: {
        customer: true,
      },
    });
  }
}
