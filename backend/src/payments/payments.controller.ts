import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentEntity, PaymentListEntity } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('payments')
  create(@Body() dto: CreatePaymentDto): Promise<PaymentEntity> {
    return this.payments.create(dto);
  }

  @Get('students/:id/payments')
  findByStudent(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: PaginationQueryDto,
  ): Promise<PaymentListEntity> {
    return this.payments.findByStudent(id, query);
  }
}
