import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, Transaction, TransactionStatus, TransactionType } from "@prisma/client";
import { ReversalStrategy } from "../interface/reversal.strategy.interface";
import { PrismaService } from "src/services/prisma.service";

@Injectable()
export class DepositReversalStrategy implements ReversalStrategy {
  constructor(private prisma: PrismaService) {}

  execute(transaction: Transaction): Prisma.PrismaPromise<unknown>[] {
    if (!transaction.toUserId) {
      throw new BadRequestException('Transação de depósito mal formada');
    }

    return [
      this.prisma.user.update({
        where: { id: transaction.toUserId },
        data: { balance: { decrement: transaction.amount } },
      }),
      this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.REVERSED },
      }),
      this.prisma.transaction.create({
        data: {
          type: TransactionType.REVERSAL,
          amount: transaction.amount,
          toUserId: transaction.toUserId,
          reversedTransactionId: transaction.id,
          status: TransactionStatus.COMPLETED,
        },
      }),
    ];
  }
}