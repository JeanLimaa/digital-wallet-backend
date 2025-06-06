import { Prisma, Transaction } from "@prisma/client";

export interface ReversalStrategy {
  execute(transaction: Transaction): Prisma.PrismaPromise<unknown>[];
}