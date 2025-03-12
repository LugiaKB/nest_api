import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { UserType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ enum: UserType })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: 'Filter by creation date start (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  createdAtStart?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date end (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  createdAtEnd?: string;

  @ApiPropertyOptional({
    description: 'Filter by update date start (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  updatedAtStart?: string;

  @ApiPropertyOptional({
    description: 'Filter by update date end (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  updatedAtEnd?: string;
}
