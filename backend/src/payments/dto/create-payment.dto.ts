import { IsInt, Max, Min } from 'class-validator';
import { MAX_MONEY } from '../../common/dto/money';
import { IsNotFutureDate } from '../../common/validators/is-not-future-date';

export class CreatePaymentDto {
  /** @example 1 */
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  studentId: number;

  /** Amount in sums. @example 500000 */
  @IsInt()
  @Min(1)
  @Max(MAX_MONEY)
  amount: number;

  /** Payment date, YYYY-MM-DD, not in the future. @example "2026-10-05" */
  @IsNotFutureDate()
  paidAt: string;
}
