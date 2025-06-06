import { IsNumber, Min } from 'class-validator';

export class CreateDepositDto {
  @IsNumber({}, {message: 'O valor deve ser um número'})
  @Min(0.01, {message: 'Valor mínimo de depósito é R$ 0,01'})
  amount: number;
}
