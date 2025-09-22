import { Expose, Transform } from 'class-transformer';
import {
  Allow,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PagerDto<T = any> {
  @Min(1)
  @IsInt()
  @Expose()
  @IsOptional({ always: true })
  @Transform(({ value: val }) => (val ? Number.parseInt(val) : 1), {
    toClassOnly: true,
  })
  page?: number;

  @Min(1)
  @Max(100)
  @IsInt()
  @IsOptional({ always: true })
  @Expose()
  @Transform(({ value: val }) => (val ? Number.parseInt(val) : 10), {
    toClassOnly: true,
  })
  limit?: number;

  @IsString()
  @IsOptional()
  field?: string;

  @IsOptional()
  filter?: {
    [column: string]: string | string[];
  };

  @IsEnum(Order)
  @IsOptional()
  @Transform(({ value }) => (value === 'asc' ? Order.ASC : Order.DESC))
  order?: Order;

  @Allow()
  _t?: number;
}
