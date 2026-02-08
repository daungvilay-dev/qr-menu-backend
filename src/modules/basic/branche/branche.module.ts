import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrancheController } from './branche.controller';
import { BrancheEntity } from './branche.entity';
import { BrancheService } from './branche.service';

const providers = [BrancheService];

@Module({
  imports: [TypeOrmModule.forFeature([BrancheEntity])],
  controllers: [BrancheController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class BrancheModule {}
