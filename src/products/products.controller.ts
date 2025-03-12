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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UserType } from '@prisma/client';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import {
  UserTypeGuard,
  AllowedUserTypes,
} from 'src/auth/guards/user-type.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @UseGuards(AuthenticationGuard, UserTypeGuard)
  @AllowedUserTypes(UserType.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @UseGuards(AuthenticationGuard, UserTypeGuard)
  @AllowedUserTypes(UserType.ADMIN)
  findAll(@Query() filters: FilterProductsDto) {
    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @UseGuards(AuthenticationGuard, UserTypeGuard)
  @AllowedUserTypes(UserType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @UseGuards(AuthenticationGuard, UserTypeGuard)
  @AllowedUserTypes(UserType.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @UseGuards(AuthenticationGuard, UserTypeGuard)
  @AllowedUserTypes(UserType.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
