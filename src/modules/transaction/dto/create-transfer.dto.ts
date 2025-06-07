import { IsNumber, Min, IsEmail, Max } from 'class-validator';

export class CreateTransferDto {
  @IsEmail({}, { message: 'O e-mail do destinatário deve ser válido' })
  toUserEmail: string;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @Min(0.01, { message: 'Valor mínimo de transferência é R$ 0,01' })
  @Max(99999999.99, { message: 'Valor máximo permitido é R$ 99.999.999,99' })
  amount: number;
}
