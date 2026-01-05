import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  employeeId: string;

  @IsString()
  branchId: string;

  @IsDateString()
  date: string;

  @IsEnum(['present', 'absent', 'late'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}



