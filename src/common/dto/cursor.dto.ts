import { Expose, Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CursorDto<T = any> {
  @Min(0)
  @IsInt()
  @Expose()
  @IsOptional({ always: true })
  @Transform(({ value: val }) => (val ? Number.parseInt(val) : 0), {
    toClassOnly: true,
  })
  cursor?: number;

  @Min(1)
  @Max(100)
  @IsInt()
  @IsOptional({ always: true })
  @Expose()
  @Transform(({ value: val }) => (val ? Number.parseInt(val) : 10), {
    toClassOnly: true,
  })
  limit?: number;
}
