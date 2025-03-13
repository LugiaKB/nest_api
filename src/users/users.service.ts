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
    const hashedPassword = await hash(createUserDto.password, 10);

    return this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
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
    await this.findOne(id);

    if (updateUserDto.password) {
      const hashedPassword = await hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.usersRepository.softDelete(id);
  }
}
