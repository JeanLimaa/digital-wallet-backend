import { IsNumber, Max, Min } from 'class-validator';

export class CreateDepositDto {
  @IsNumber({}, {message: 'O valor deve ser um número'})
  @Min(0.01, {message: 'Valor mínimo de depósito é R$ 0,01'})
  @Max(99999999.99, { message: 'Valor máximo permitido é R$ 99.999.999,99' })
  amount: number;
}
