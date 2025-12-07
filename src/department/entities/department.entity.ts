import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
export class Department {
  @ApiProperty()
  name: string;

  @ApiProperty({
    description: 'The age of a cat',
    minimum: 1,
    default: 1,
  })
  age: number;

  @ApiProperty()
  breed: string;
}
