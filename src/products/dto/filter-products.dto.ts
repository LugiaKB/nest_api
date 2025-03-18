import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { BaseFilterDto } from '../../common/dto/base-filter.dto';

export class FilterProductsDto extends BaseFilterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  minUnitPrice?: number;

  @IsNumber()
  @IsOptional()
  maxUnitPrice?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
