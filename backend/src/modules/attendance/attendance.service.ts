import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto, userRole: Role, userBranchId?: string) {
    // Manager cannot create
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot create attendance records');
    }

    // Staff can only create in their branch
    if (userRole === Role.STAFF && createAttendanceDto.branchId !== userBranchId) {
      throw new ForbiddenException('You can only create attendance in your branch');
    }

    return this.prisma.attendance.create({
      data: createAttendanceDto,
      include: { employee: true, branch: true },
    });
  }

  async findAll(userRole: Role, userBranchId?: string, branchId?: string, employeeId?: string) {
    let where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (userRole === Role.ADMIN) {
      if (branchId) {
        where.branchId = branchId;
      }
    } else if (userRole === Role.MANAGER) {
      if (branchId) {
        where.branchId = branchId;
      }
    } else if (userRole === Role.STAFF) {
      where.branchId = userBranchId;
    }

    return this.prisma.attendance.findMany({
      where,
      include: { employee: true, branch: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userRole: Role, userBranchId?: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: { employee: true, branch: true },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (userRole === Role.STAFF && attendance.branchId !== userBranchId) {
      throw new ForbiddenException('Access denied');
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot update attendance');
    }

    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (userRole === Role.STAFF && attendance.branchId !== userBranchId) {
      throw new ForbiddenException('You can only update attendance in your branch');
    }

    return this.prisma.attendance.update({
      where: { id },
      data: updateAttendanceDto,
      include: { employee: true, branch: true },
    });
  }

  async remove(id: string, userRole: Role, userBranchId?: string) {
    if (userRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot delete attendance');
    }

    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (userRole === Role.STAFF && attendance.branchId !== userBranchId) {
      throw new ForbiddenException('You can only delete attendance in your branch');
    }

    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}



