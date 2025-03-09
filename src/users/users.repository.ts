import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { User, Prisma } from '@prisma/client';
import { FilterUsersDto } from './dto/filter-users.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll(filters: FilterUsersDto) {
    const {
      page = 1,
      limit = 10,
      name,
      email,
      userType,
      createdAtStart,
      createdAtEnd,
      updatedAtStart,
      updatedAtEnd,
    } = filters;
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
          client: {
            select: {
              fullName: true,
              phoneNumber: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
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
