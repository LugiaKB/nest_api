import { IsString, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateCustomerWithUserDataDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
