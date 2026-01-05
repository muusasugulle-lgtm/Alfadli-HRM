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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() createEmployeeDto: CreateEmployeeDto, @CurrentUser() user: any) {
    return this.employeesService.create(createEmployeeDto, user.role, user.branchId);
  }

  @Get()
  findAll(@Query('branchId') branchId?: string, @CurrentUser() user?: any) {
    return this.employeesService.findAll(user.role, user.branchId, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.employeesService.findOne(id, user.role, user.branchId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentUser() user: any,
  ) {
    return this.employeesService.update(id, updateEmployeeDto, user.role, user.branchId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.employeesService.remove(id, user.role, user.branchId);
  }
}



