import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Role } from '@prisma/client';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can create branches');
    }

    return this.prisma.branch.create({
      data: createBranchDto,
    });
  }

  async findAll(userRole: Role, userBranchId?: string) {
    // Admin can see all branches
    if (userRole === Role.ADMIN) {
      return this.prisma.branch.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    // Manager can view all branches
    if (userRole === Role.MANAGER) {
      return this.prisma.branch.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    // Staff can only see their branch
    if (userRole === Role.STAFF && userBranchId) {
      return this.prisma.branch.findMany({
        where: { id: userBranchId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  }

  async findOne(id: string, userRole: Role, userBranchId?: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Admin and Manager can access any branch
    if (userRole === Role.ADMIN || userRole === Role.MANAGER) {
      return branch;
    }

    // Staff can only access their branch
    if (userRole === Role.STAFF && userBranchId !== id) {
      throw new ForbiddenException('Access denied to this branch');
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update branches');
    }

    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  async remove(id: string, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete branches');
    }

    return this.prisma.branch.delete({
      where: { id },
    });
  }
}



