import { PartialType } from '@nestjs/mapped-types';
import {
  CreateCustomerWithUserDataDto,
  CreateCustomerDto,
} from './create-customer.dto';

export class UpdateCustomerWithUserDataDto extends PartialType(
  CreateCustomerWithUserDataDto,
) {}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
