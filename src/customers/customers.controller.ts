import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerWithUserDataDto } from './dto/create-customer.dto';
import { UpdateCustomerWithUserDataDto } from './dto/update-customer.dto';
import { FilterCustomersWithUsersDataDto } from './dto/filter-customers.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerWithUserDataDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll(@Query() filters: FilterCustomersWithUsersDataDto) {
    return this.customersService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerWithUserDataDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
