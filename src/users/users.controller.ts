import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { AuthenticationGuard } from '../auth/guards/authentication.guard';
import {
  UserTypeGuard,
  AllowedUserTypes,
} from '../auth/guards/user-type.guard';
import { UserType } from '@prisma/client';
import { ResourceOwnerGuard } from '../auth/guards/resource-owner.guard';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'Creates a new user in the system',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @UseGuards(AuthenticationGuard, UserTypeGuard)
  @AllowedUserTypes(UserType.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description: 'Returns a paginated list of users with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  @UseGuards(AuthenticationGuard, UserTypeGuard)
  @AllowedUserTypes(UserType.ADMIN)
  findAll(@Query() filters: FilterUsersDto) {
    return this.usersService.findAll(filters);
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({
    summary: "Get authenticated user's data",
    description: 'Returns information about the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user data retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findCurrentUser(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Returns a single user by their ID',
  })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AuthenticationGuard, ResourceOwnerGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: "Updates an existing user's information",
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AuthenticationGuard, ResourceOwnerGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Soft deletes a user from the system',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AuthenticationGuard, ResourceOwnerGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
