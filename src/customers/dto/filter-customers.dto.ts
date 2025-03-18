import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { FilterUsersDto } from 'src/users/dto/filter-users.dto';

export class FilterCustomersWithUsersDataDto extends FilterUsersDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}

export class FilterCustomersDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}
