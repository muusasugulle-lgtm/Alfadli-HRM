import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() createAttendanceDto: CreateAttendanceDto, @CurrentUser() user: any) {
    return this.attendanceService.create(createAttendanceDto, user.role, user.branchId);
  }

  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('employeeId') employeeId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.attendanceService.findAll(user.role, user.branchId, branchId, employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.attendanceService.findOne(id, user.role, user.branchId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() user: any,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto, user.role, user.branchId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.attendanceService.remove(id, user.role, user.branchId);
  }
}



