import { Injectable } from '@nestjs/common';
import {
  InvalidCredentialsError,
  UnauthorizedError,
} from '../common/errors/application.errors';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      return user;
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw error;
      }
      throw new UnauthorizedError();
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        userType: user.userType,
      };

      return {
        token: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
        },
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw error;
      }
      throw new UnauthorizedError();
    }
  }
}
