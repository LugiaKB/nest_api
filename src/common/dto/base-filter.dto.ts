import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class BaseFilterDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value))
  page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value))
  limit: number = 10;

  @IsString()
  @IsOptional()
  orderBy?: string;

  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'asc';
}
