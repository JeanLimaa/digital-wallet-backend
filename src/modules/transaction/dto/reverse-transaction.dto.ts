import { IsUUID } from 'class-validator';

export class ReverseTransactionDto {
  @IsUUID('4', { message: 'O ID da transação deve ser um UUID válido' })
  transactionId: string;
}
