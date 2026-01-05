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
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() createPayrollDto: CreatePayrollDto, @CurrentUser() user: any) {
    return this.payrollService.create(createPayrollDto, user.role, user.branchId);
  }

  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @CurrentUser() user?: any,
  ) {
    return this.payrollService.findAll(user.role, user.branchId, branchId, employeeId, month, year);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.findOne(id, user.role, user.branchId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  update(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.update(id, updatePayrollDto, user.role, user.branchId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.remove(id, user.role, user.branchId);
  }
}



