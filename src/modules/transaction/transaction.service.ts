import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { UserService } from '../user/user.service';
import { ReversalStrategyFactory } from './strategies/reversal-strategy.factory';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly reversalStrategyFactory: ReversalStrategyFactory,
  ) {}

  public async deposit(dto: CreateDepositDto, userId: string) {
    await this.userService.findOrThrowById(userId);

    const [updatedUser, transaction] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: dto.amount } },
      }),
      this.prisma.transaction.create({
        data: {
          type: TransactionType.DEPOSIT,
          amount: dto.amount,
          toUserId: userId,
          status: TransactionStatus.COMPLETED,
        },
      }),
    ]);

    return { updatedUser, transaction };
  }

  public async transfer(dto: CreateTransferDto, fromUserId: string) {
    const fromUser = await this.userService.findOrThrowById(fromUserId);
    const toUser = await this.userService.findOrThrowByEmail(dto.toUserEmail);
    
    if (fromUserId === toUser.id) {
      throw new ForbiddenException('Você não pode transferir para si mesmo');
    }

    if (Number(fromUser.balance) < dto.amount) throw new BadRequestException('Saldo insuficiente');

    const [_, __, transaction] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: fromUserId },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prisma.user.update({
        where: { id: toUser.id },
        data: { balance: { increment: dto.amount } },
      }),
      this.prisma.transaction.create({
        data: {
          type: TransactionType.TRANSFER,
          amount: dto.amount,
          fromUserId,
          toUserId: toUser.id,
          status: TransactionStatus.COMPLETED,
        },
      }),
    ]);

    return transaction;
  }

  public async reverse(dto: ReverseTransactionDto, userId: string) {
    const transaction = await this.findTransactionOrThrowById(dto.transactionId);

    if (transaction.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Transação já foi revertida');
    }

    if (transaction.type === TransactionType.REVERSAL) {
      throw new BadRequestException('Não é possível reverter uma transação de reversão');
    }

    const isSenderOrReceiver = transaction.fromUserId === userId || transaction.toUserId === userId;
    if (!isSenderOrReceiver) {
      throw new ForbiddenException('Você não tem permissão para reverter esta transação');
    }

    const strategy = this.reversalStrategyFactory.getStrategy(transaction);
    const operations = strategy.execute(transaction);

    await this.prisma.$transaction(operations);

    return { message: 'Transação revertida com sucesso' };
  }

  public async getTransactionHistory(userId: string) {
    await this.userService.findOrThrowById(userId);
    
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        toUser: {
          select: {
            email: true,
            name: true,
          }
        },
        fromUser: {
          select: {
            email: true,
            name: true,
          }
        },
        reversedTransaction: {
          select: {
            id: true,
            amount: true,
            type: true,
            createdAt: true,
          }
        }
      }
    });

    // Se o user é quem recebeu o depósito/transferencia, tipo vira RECEIVED
    const adjustedTransactions = transactions.map(tx => {
      const isReceived = tx.type === 'TRANSFER' && tx.toUserId === userId && tx.fromUserId !== userId;
      const isPositive = 
        tx.type === 'DEPOSIT' 
        || (tx.type === 'TRANSFER' && tx.toUserId === userId)
        || (tx.type === 'REVERSAL' && tx.reversedTransaction.type === "TRANSFER" && tx.toUserId === userId);
      
      const received = {...tx, isPositive, type: 'RECEIVED'};
      if (isReceived) return received
      
      return {...tx, isPositive};
    });

    return adjustedTransactions;
  }

  private async findTransactionOrThrowById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }
}