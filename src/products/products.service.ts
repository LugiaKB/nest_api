import { Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../common/errors/application.errors';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(createProductDto: CreateProductDto) {
    return this.productsRepository.create(createProductDto);
  }

  findAll(filters: FilterProductsDto) {
    return this.productsRepository.findAll(filters);
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      throw new EntityNotFoundError('Product');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return this.productsRepository.update(id, updateProductDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.productsRepository.softDelete(id);
  }
}
