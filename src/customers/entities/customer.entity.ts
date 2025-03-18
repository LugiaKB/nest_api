import { Customer as PrismaCustomer } from '@prisma/client';
import { User } from 'src/users/entities/user.entity';

export class Customer implements PrismaCustomer {
  userId: string;
  user: User;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: boolean;
}
