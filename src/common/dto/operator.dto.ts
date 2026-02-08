import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class OperatorDto {
  @ApiHideProperty()
  @Exclude()
  @IsOptional()
  @IsInt()
  createBy: number;

  @ApiHideProperty()
  @Exclude()
  @IsOptional()
  @IsInt()
  updateBy: number;
}
