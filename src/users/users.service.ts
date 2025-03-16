import { Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../common/errors/application.errors';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { hash } from 'bcrypt';
import { FilterUsersDto } from './dto/filter-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const userData = await this.hashUserPassword(createUserDto);

    return this.usersRepository.create(userData);
  }

  findAll(filters: FilterUsersDto) {
    return this.usersRepository.findAll(filters);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new EntityNotFoundError('User');

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new EntityNotFoundError('User');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const updatedUser = { ...user, ...updateUserDto };

    const userData = updateUserDto.password
      ? await this.hashUserPassword(updatedUser)
      : updatedUser;

    return this.usersRepository.update(id, userData);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.usersRepository.softDelete(id);
  }

  async hashUserPassword<T extends CreateUserDto>(user: T): Promise<T> {
    if (user.password) {
      const hashedPassword = await hash(user.password, 10);
      return { ...user, password: hashedPassword };
    }

    return user;
  }
}
