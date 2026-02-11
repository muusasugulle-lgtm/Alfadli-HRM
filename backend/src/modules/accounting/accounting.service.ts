import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  // Income methods
  async createIncome(createIncomeDto: CreateIncomeDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot create income records');
    }

    if (userRole === Role.STAFF && createIncomeDto.branchId !== userBranchId) {
      throw new ForbiddenException('You can only create income in your branch');
    }

    // Convert date string to Date object for Prisma
    const data = {
      branchId: createIncomeDto.branchId,
      amount: createIncomeDto.amount,
      date: new Date(createIncomeDto.date),
      description: createIncomeDto.description || null,
    };

    return this.prisma.income.create({
      data,
      include: { branch: true },
    });
  }

  async findAllIncomes(userRole: Role, userBranchId?: string, branchId?: string, startDate?: string, endDate?: string) {
    let where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (userRole === Role.ADMIN) {
      if (branchId) where.branchId = branchId;
    } else if (userRole === Role.MANAGER) {
      if (branchId) where.branchId = branchId;
    } else if (userRole === Role.STAFF) {
      where.branchId = userBranchId;
    }

    return this.prisma.income.findMany({
      where,
      include: { branch: true },
      orderBy: { date: 'desc' },
    });
  }

  async updateIncome(id: string, updateIncomeDto: UpdateIncomeDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot update income');
    }

    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) throw new NotFoundException('Income not found');

    if (userRole === Role.STAFF && income.branchId !== userBranchId) {
      throw new ForbiddenException('You can only update income in your branch');
    }

    // Convert date string to Date object if provided
    const data: any = { ...updateIncomeDto };
    if (updateIncomeDto.date) {
      data.date = new Date(updateIncomeDto.date);
    }

    return this.prisma.income.update({
      where: { id },
      data,
      include: { branch: true },
    });
  }

  async removeIncome(id: string, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot delete income');
    }

    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) throw new NotFoundException('Income not found');

    if (userRole === Role.STAFF && income.branchId !== userBranchId) {
      throw new ForbiddenException('You can only delete income in your branch');
    }

    return this.prisma.income.delete({ where: { id } });
  }

  // Expense methods
  async createExpense(createExpenseDto: CreateExpenseDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot create expense records');
    }

    if (userRole === Role.STAFF && createExpenseDto.branchId !== userBranchId) {
      throw new ForbiddenException('You can only create expenses in your branch');
    }

    // Convert date string to Date object for Prisma
    const data = {
      branchId: createExpenseDto.branchId,
      categoryId: createExpenseDto.categoryId,
      amount: createExpenseDto.amount,
      date: new Date(createExpenseDto.date),
      description: createExpenseDto.description || null,
    };

    return this.prisma.expense.create({
      data,
      include: { branch: true, category: true },
    });
  }

  async findAllExpenses(userRole: Role, userBranchId?: string, branchId?: string, startDate?: string, endDate?: string) {
    let where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (userRole === Role.ADMIN) {
      if (branchId) where.branchId = branchId;
    } else if (userRole === Role.MANAGER) {
      if (branchId) where.branchId = branchId;
    } else if (userRole === Role.STAFF) {
      where.branchId = userBranchId;
    }

    return this.prisma.expense.findMany({
      where,
      include: { branch: true, category: true },
      orderBy: { date: 'desc' },
    });
  }

  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot update expenses');
    }

    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');

    if (userRole === Role.STAFF && expense.branchId !== userBranchId) {
      throw new ForbiddenException('You can only update expenses in your branch');
    }

    // Convert date string to Date object if provided
    const data: any = { ...updateExpenseDto };
    if (updateExpenseDto.date) {
      data.date = new Date(updateExpenseDto.date);
    }

    return this.prisma.expense.update({
      where: { id },
      data,
      include: { branch: true, category: true },
    });
  }

  async removeExpense(id: string, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot delete expenses');
    }

    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');

    if (userRole === Role.STAFF && expense.branchId !== userBranchId) {
      throw new ForbiddenException('You can only delete expenses in your branch');
    }

    return this.prisma.expense.delete({ where: { id } });
  }

  // Expense Categories (Admin only)
  async createCategory(name: string, description?: string, userRole?: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can create expense categories');
    }

    return this.prisma.expenseCategory.create({
      data: { name, description },
    });
  }

  async findAllCategories() {
    return this.prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Profit/Loss calculation
  async getProfitLoss(branchId?: string, startDate?: string, endDate?: string) {
    let incomeWhere: any = {};
    let expenseWhere: any = {};

    if (branchId) {
      incomeWhere.branchId = branchId;
      expenseWhere.branchId = branchId;
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      incomeWhere.date = dateFilter;
      expenseWhere.date = dateFilter;
    }

    const [incomes, expenses] = await Promise.all([
      this.prisma.income.findMany({ where: incomeWhere }),
      this.prisma.expense.findMany({ where: expenseWhere }),
    ]);

    const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const profit = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      profit,
      incomes: incomes.length,
      expenses: expenses.length,
    };
  }
}
