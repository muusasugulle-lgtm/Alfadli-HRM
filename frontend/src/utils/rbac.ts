import { User } from '../services/auth.service';

export const canView = (user: User | null): boolean => {
  return !!user;
};

export const canAdd = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'STAFF';
};

export const canEdit = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'STAFF';
};

export const canDelete = (user: User | null, limited: boolean = false): boolean => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'STAFF' && !limited) return true;
  return false;
};

export const canAccessBranch = (user: User | null, branchId?: string): boolean => {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
  if (user.role === 'STAFF') {
    return !branchId || user.branchId === branchId;
  }
  return false;
};



