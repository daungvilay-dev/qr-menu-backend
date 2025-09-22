import { Exclude } from 'class-transformer';

export class OperatorDto {
  @Exclude()
  createBy: number;

  @Exclude()
  updateBy: number;
}
