import { IsInt, IsString, Length, Matches, Max, Min } from 'class-validator';
import { MAX_MONEY } from '../../common/dto/money';
import { Trim } from '../../common/utils/trim';

export class CreateStudentDto {
  /** @example "Алиев Азиз" */
  @Trim()
  @IsString()
  @Length(2, 100)
  name: string;

  /** Uzbek phone number in +998XXXXXXXXX format. @example "+998901234567" */
  @Trim()
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'phone must match +998XXXXXXXXX' })
  phone: string;

  /** @example "Frontend-1" */
  @Trim()
  @IsString()
  @Length(1, 50)
  group: string;

  /** Monthly fee in sums. @example 500000 */
  @IsInt()
  @Min(1)
  @Max(MAX_MONEY)
  monthlyFee: number;
}
