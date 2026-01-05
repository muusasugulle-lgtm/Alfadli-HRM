import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { Role } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async create(createPayrollDto: CreatePayrollDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot create payroll records');
    }

    if (userRole === Role.STAFF && createPayrollDto.branchId !== userBranchId) {
      throw new ForbiddenException('You can only create payroll in your branch');
    }

    // Calculate total
    const total = 
      Number(createPayrollDto.baseSalary) + 
      Number(createPayrollDto.bonuses) + 
      Number(createPayrollDto.adjustments);

    return this.prisma.payroll.create({
      data: {
        ...createPayrollDto,
        total,
      },
      include: { employee: true, branch: true },
    });
  }

  async findAll(userRole: Role, userBranchId?: string, branchId?: string, employeeId?: string, month?: number, year?: number) {
    let where: any = {};

    if (employeeId) where.employeeId = employeeId;
    if (month) where.month = month;
    if (year) where.year = year;

    if (userRole === Role.ADMIN) {
      if (branchId) where.branchId = branchId;
    } else if (userRole === Role.MANAGER) {
      if (branchId) where.branchId = branchId;
    } else if (userRole === Role.STAFF) {
      where.branchId = userBranchId;
    }

    return this.prisma.payroll.findMany({
      where,
      include: { employee: true, branch: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(id: string, userRole: Role, userBranchId?: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: { employee: true, branch: true },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    if (userRole === Role.STAFF && payroll.branchId !== userBranchId) {
      throw new ForbiddenException('Access denied');
    }

    return payroll;
  }

  async update(id: string, updatePayrollDto: UpdatePayrollDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot update payroll');
    }

    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    if (userRole === Role.STAFF && payroll.branchId !== userBranchId) {
      throw new ForbiddenException('You can only update payroll in your branch');
    }

    // Recalculate total if needed
    const baseSalary = updatePayrollDto.baseSalary ?? payroll.baseSalary;
    const bonuses = updatePayrollDto.bonuses ?? payroll.bonuses;
    const adjustments = updatePayrollDto.adjustments ?? payroll.adjustments;
    const total = Number(baseSalary) + Number(bonuses) + Number(adjustments);

    return this.prisma.payroll.update({
      where: { id },
      data: {
        ...updatePayrollDto,
        total,
      },
      include: { employee: true, branch: true },
    });
  }

  async remove(id: string, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot delete payroll');
    }

    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    if (userRole === Role.STAFF && payroll.branchId !== userBranchId) {
      throw new ForbiddenException('You can only delete payroll in your branch');
    }

    return this.prisma.payroll.delete({
      where: { id },
    });
  }
}



