import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class BranchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const branchId = request.params.branchId || request.body.branchId || request.query.branchId;

    // Admin can access all branches
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Manager can view all branches but cannot modify
    if (user.role === Role.MANAGER) {
      // For read operations, allow access to all branches
      if (['GET', 'HEAD'].includes(request.method)) {
        return true;
      }
      // For write operations, deny access
      throw new ForbiddenException('Managers cannot modify data');
    }

    // Staff can only access their assigned branch
    if (user.role === Role.STAFF) {
      if (user.branchId && branchId && user.branchId !== branchId) {
        throw new ForbiddenException('Access denied to this branch');
      }
      // If no branchId in request, use user's branch
      if (!branchId && user.branchId) {
        request.branchId = user.branchId;
      }
      return true;
    }

    return false;
  }
}



