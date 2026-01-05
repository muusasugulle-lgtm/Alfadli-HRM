import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayrollDto {
  @IsString()
  employeeId: string;

  @IsString()
  branchId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Type(() => Number)
  year: number;

  @IsNumber()
  @Type(() => Number)
  baseSalary: number;

  @IsNumber()
  @Type(() => Number)
  adjustments: number;

  @IsNumber()
  @Type(() => Number)
  bonuses: number;
}



