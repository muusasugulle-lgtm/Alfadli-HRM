import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService, PrismaService],
  exports: [BranchesService],
})
export class BranchesModule {}



