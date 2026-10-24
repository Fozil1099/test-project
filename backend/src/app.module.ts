import { Module } from '@nestjs/common';
import { DebtorsModule } from './debtors/debtors.module';
import { HealthController } from './health/health.controller';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [PrismaModule, StudentsModule, PaymentsModule, DebtorsModule],
  controllers: [HealthController],
})
export class AppModule {}
