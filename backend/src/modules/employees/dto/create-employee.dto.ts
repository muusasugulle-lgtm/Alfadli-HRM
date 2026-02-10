import { IsString, IsEmail, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsNumber()
  @Type(() => Number)
  salary: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsString()
  branchId: string;
}
