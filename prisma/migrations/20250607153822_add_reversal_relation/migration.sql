-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_reversedTransactionId_fkey` FOREIGN KEY (`reversedTransactionId`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
