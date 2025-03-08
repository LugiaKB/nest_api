import { User as PrismaUser, UserType } from '@prisma/client';

export class User implements PrismaUser {
  id: string;
  name: string;
  email: string;
  password: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
