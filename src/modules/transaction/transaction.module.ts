import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { UserModule } from '../user/user.module';
import { TransactionsService } from './transaction.service';
import { TransactionsController } from './transaction.controller';

@Module({
  imports: [
    UserModule
  ],
  providers: [
    TransactionsService,
    PrismaService
  ],
  controllers: [TransactionsController],
})
export class TransactionModule {}
