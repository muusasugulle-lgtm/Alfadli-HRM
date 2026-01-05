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
import { AccountingService } from './accounting.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // Income endpoints
  @Post('income')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  createIncome(@Body() createIncomeDto: CreateIncomeDto, @CurrentUser() user: any) {
    return this.accountingService.createIncome(createIncomeDto, user.role, user.branchId);
  }

  @Get('income')
  findAllIncomes(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.accountingService.findAllIncomes(user.role, user.branchId, branchId, startDate, endDate);
  }

  @Patch('income/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  updateIncome(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto, @CurrentUser() user: any) {
    return this.accountingService.updateIncome(id, updateIncomeDto, user.role, user.branchId);
  }

  @Delete('income/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  removeIncome(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountingService.removeIncome(id, user.role, user.branchId);
  }

  // Expense endpoints
  @Post('expense')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  createExpense(@Body() createExpenseDto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.accountingService.createExpense(createExpenseDto, user.role, user.branchId);
  }

  @Get('expense')
  findAllExpenses(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.accountingService.findAllExpenses(user.role, user.branchId, branchId, startDate, endDate);
  }

  @Patch('expense/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  updateExpense(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @CurrentUser() user: any) {
    return this.accountingService.updateExpense(id, updateExpenseDto, user.role, user.branchId);
  }

  @Delete('expense/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  removeExpense(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountingService.removeExpense(id, user.role, user.branchId);
  }

  // Expense Categories
  @Post('expense-category')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createCategory(@Body() body: { name: string; description?: string }, @CurrentUser() user: any) {
    return this.accountingService.createCategory(body.name, body.description, user.role);
  }

  @Get('expense-category')
  findAllCategories() {
    return this.accountingService.findAllCategories();
  }

  // Profit/Loss
  @Get('profit-loss')
  getProfitLoss(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getProfitLoss(branchId, startDate, endDate);
  }
}



