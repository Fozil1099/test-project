import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DebtorsQueryDto } from './dto/debtors-query.dto';
import { DebtorListEntity } from './entities/debtor.entity';
import { DebtorsService } from './debtors.service';

@ApiTags('debtors')
@Controller('debtors')
export class DebtorsController {
  constructor(private readonly debtors: DebtorsService) {}

  @Get()
  findDebtors(@Query() query: DebtorsQueryDto): Promise<DebtorListEntity> {
    return this.debtors.findDebtors(query);
  }
}
