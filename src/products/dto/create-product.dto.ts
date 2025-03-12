import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Smartphone XYZ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Latest model smartphone with...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;
}
