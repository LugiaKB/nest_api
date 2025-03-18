import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'nestjs-prisma';
import { CustomersRepository } from './customers.repository';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomersRepository,
    UsersService,
    UsersRepository,
    PrismaService,
  ],
})
export class CustomersModule {}
