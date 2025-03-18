import { Injectable } from '@nestjs/common';
import { CreateCustomerWithUserDataDto } from './dto/create-customer.dto';
import { UpdateCustomerWithUserDataDto } from './dto/update-customer.dto';
import { UsersService } from 'src/users/users.service';
import { CustomersRepository } from './customers.repository';
import { EntityNotFoundError } from 'src/common/errors/application.errors';
import { User } from 'src/users/entities/user.entity';
import {
  FilterCustomersDto,
  FilterCustomersWithUsersDataDto,
} from './dto/filter-customers.dto';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class CustomersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly customersRepository: CustomersRepository,
  ) {}

  async create(createCustomerWithUserDataDto: CreateCustomerWithUserDataDto) {
    const { name, email, password, ...customerData } =
      createCustomerWithUserDataDto;

    const userData = await this.usersService.hashUserPassword({
      name,
      email,
      password,
    });

    return this.customersRepository.createWithUser(customerData, userData);
  }

  findAll(filters: FilterCustomersWithUsersDataDto) {
    const { fullName, phoneNumber, address, status, ...userFilters } = filters;

    const customerFilters: FilterCustomersDto = {
      fullName,
      phoneNumber,
      address,
      status,
    };

    return this.usersRepository.findAll(userFilters, customerFilters);
  }

  async findOne(userId: string): Promise<User> {
    const user = await this.customersRepository.findOne(userId);
    if (!user) throw new EntityNotFoundError('User or Customer');

    return user;
  }

  async update(
    userId: string,
    updateCustomerWithUserDataDto: UpdateCustomerWithUserDataDto,
  ): Promise<User> {
    const { name, email, password, ...customerData } =
      updateCustomerWithUserDataDto;

    const user = await this.findOne(userId);

    const { customer, ...userData } = user;

    const updatedUserData = {
      ...userData,
      ...(name && { name }),
      ...(email && { email }),
      ...(password && { password }),
    };

    const updatedCustomerData = {
      ...customer,
      ...customerData,
    };

    return this.customersRepository.updateWithUser(
      userId,
      updatedCustomerData,
      updatedUserData,
    );
  }

  async remove(userId: string) {
    await this.findOne(userId);
    return this.customersRepository.softDelete(userId);
  }
}
