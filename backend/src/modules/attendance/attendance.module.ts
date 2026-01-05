import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService],
  exports: [AttendanceService],
})
export class AttendanceModule {}



