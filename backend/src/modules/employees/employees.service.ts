import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Role } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto, userRole: Role, userBranchId?: string) {
    // Admin can create employees in any branch
    // Staff can only create employees in their branch
    if (userRole === Role.STAFF && createEmployeeDto.branchId !== userBranchId) {
      throw new ForbiddenException('You can only create employees in your branch');
    }

    // Convert data types for Prisma
    const data = {
      name: createEmployeeDto.name,
      email: createEmployeeDto.email || null,
      phone: createEmployeeDto.phone || null,
      position: createEmployeeDto.position || null,
      salary: createEmployeeDto.salary,
      startDate: new Date(createEmployeeDto.startDate),
      status: createEmployeeDto.status || 'active',
      branchId: createEmployeeDto.branchId,
    };

    return this.prisma.employee.create({
      data,
      include: { branch: true },
    });
  }

  async findAll(userRole: Role, userBranchId?: string, branchId?: string) {
    let where: any = {};

    // Admin can see all employees
    if (userRole === Role.ADMIN) {
      if (branchId) {
        where.branchId = branchId;
      }
    }
    // Manager can view all employees (read-only)
    else if (userRole === Role.MANAGER) {
      if (branchId) {
        where.branchId = branchId;
      }
    }
    // Staff can only see employees in their branch
    else if (userRole === Role.STAFF) {
      where.branchId = userBranchId;
    }

    return this.prisma.employee.findMany({
      where,
      include: { branch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userRole: Role, userBranchId?: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Admin and Manager can access any employee
    if (userRole === Role.ADMIN || userRole === Role.MANAGER) {
      return employee;
    }

    // Staff can only access employees in their branch
    if (userRole === Role.STAFF && employee.branchId !== userBranchId) {
      throw new ForbiddenException('Access denied to this employee');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, userRole: Role, userBranchId?: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Manager cannot update
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot update employees');
    }

    // Staff can only update employees in their branch
    if (userRole === Role.STAFF && employee.branchId !== userBranchId) {
      throw new ForbiddenException('You can only update employees in your branch');
    }

    // Convert data types for Prisma
    const data: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.startDate) {
      data.startDate = new Date(updateEmployeeDto.startDate);
    }

    return this.prisma.employee.update({
      where: { id },
      data,
      include: { branch: true },
    });
  }

  async remove(id: string, userRole: Role, userBranchId?: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Manager cannot delete
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot delete employees');
    }

    // Staff can only delete employees in their branch (with limited permissions)
    if (userRole === Role.STAFF) {
      if (employee.branchId !== userBranchId) {
        throw new ForbiddenException('You can only delete employees in your branch');
      }
    }

    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
