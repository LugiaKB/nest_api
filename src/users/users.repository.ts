import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { User, Prisma } from '@prisma/client';
import { FilterUsersDto } from './dto/filter-users.dto';
import { buildPaginationResponse } from 'src/common/utils/pagination.util';
import { UserWithoutSensitiveInfo } from './entities/user.entity';
import { IPaginatedData } from 'src/common/interfaces/http-response.interface';
import { FilterCustomersDto } from 'src/customers/dto/filter-customers.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll(
    filters: FilterUsersDto,
    customerFilters?: FilterCustomersDto,
  ): Promise<IPaginatedData<UserWithoutSensitiveInfo>> {
    const {
      page,
      limit,
      name,
      email,
      userType,
      createdAtStart,
      createdAtEnd,
      updatedAtStart,
      updatedAtEnd,
    } = filters;

    const { fullName, phoneNumber, address, status } = customerFilters || {};

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(userType && { userType }),
      ...((createdAtStart || createdAtEnd) && {
        createdAt: {
          ...(createdAtStart && { gte: new Date(createdAtStart) }),
          ...(createdAtEnd && { lte: new Date(createdAtEnd) }),
        },
      }),
      ...((updatedAtStart || updatedAtEnd) && {
        updatedAt: {
          ...(updatedAtStart && { gte: new Date(updatedAtStart) }),
          ...(updatedAtEnd && { lte: new Date(updatedAtEnd) }),
        },
      }),
      ...(customerFilters && {
        customer: {
          ...(fullName && {
            fullName: { contains: fullName, mode: 'insensitive' },
          }),
          ...(phoneNumber && { phoneNumber: { contains: phoneNumber } }),
          ...(address && {
            address: { contains: address, mode: 'insensitive' },
          }),
          ...(status !== undefined && { status }),
        },
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              userId: true,
              fullName: true,
              address: true,
              phoneNumber: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginationResponse<UserWithoutSensitiveInfo>(
      users,
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
