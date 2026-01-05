import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Role } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot create sales records');
    }

    if (userRole === Role.STAFF && createSaleDto.branchId !== userBranchId) {
      throw new ForbiddenException('You can only create sales in your branch');
    }

    return this.prisma.sale.create({
      data: createSaleDto,
      include: { branch: true },
    });
  }

  async findAll(userRole: Role, userBranchId?: string, branchId?: string, startDate?: string, endDate?: string) {
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

    return this.prisma.sale.findMany({
      where,
      include: { branch: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userRole: Role, userBranchId?: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (userRole === Role.STAFF && sale.branchId !== userBranchId) {
      throw new ForbiddenException('Access denied');
    }

    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot update sales');
    }

    const sale = await this.prisma.sale.findUnique({
      where: { id },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (userRole === Role.STAFF && sale.branchId !== userBranchId) {
      throw new ForbiddenException('You can only update sales in your branch');
    }

    return this.prisma.sale.update({
      where: { id },
      data: updateSaleDto,
      include: { branch: true },
    });
  }

  async remove(id: string, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot delete sales');
    }

    const sale = await this.prisma.sale.findUnique({
      where: { id },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (userRole === Role.STAFF && sale.branchId !== userBranchId) {
      throw new ForbiddenException('You can only delete sales in your branch');
    }

    return this.prisma.sale.delete({
      where: { id },
    });
  }

  async getSalesSummary(branchId?: string, startDate?: string, endDate?: string) {
    let where: any = {};

    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const sales = await this.prisma.sale.findMany({ where });

    const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const totalProfit = sales.reduce((sum, sale) => sum + Number(sale.profit), 0);

    return {
      totalSales: sales.length,
      totalAmount,
      totalProfit,
      averageAmount: sales.length > 0 ? totalAmount / sales.length : 0,
      averageProfit: sales.length > 0 ? totalProfit / sales.length : 0,
    };
  }
}



