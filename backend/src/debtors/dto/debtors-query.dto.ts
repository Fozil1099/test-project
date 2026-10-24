import { Matches } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MONTH_REGEX } from '../../common/utils/date';

export class DebtorsQueryDto extends PaginationQueryDto {
  /** Month in YYYY-MM format. @example "2026-10" */
  @Matches(MONTH_REGEX, { message: 'month must be in YYYY-MM format' })
  month: string;
}
