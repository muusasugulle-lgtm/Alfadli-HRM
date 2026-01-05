import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleDto {
  @IsString()
  branchId: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsNumber()
  @Type(() => Number)
  profit: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  note?: string;
}



