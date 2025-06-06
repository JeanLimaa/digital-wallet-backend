import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [UserModule, AuthModule, TransactionModule],
  providers: [PrismaService],
})
export class AppModule {}
