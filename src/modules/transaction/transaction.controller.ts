import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/GetUser.decorator';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  deposit(
    @Body() dto: CreateDepositDto,
    @GetUser('id') userId: string,
  ) {
    return this.transactionsService.deposit(dto, userId);
  }

  @Post('transfer')
  transfer(
    @Body() dto: CreateTransferDto,
    @GetUser('id') userId: string,
  ) {
    return this.transactionsService.transfer(dto, userId);
  }

  @Get('history')
  getTransactionHistory(
    @GetUser('id') userId: string,
  ) {
    return this.transactionsService.getTransactionHistory(userId);
  }
}