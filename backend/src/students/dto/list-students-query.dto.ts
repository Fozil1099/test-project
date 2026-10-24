import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Trim } from '../../common/utils/trim';

export class ListStudentsQueryDto extends PaginationQueryDto {
  /** Case-insensitive substring of name or phone */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Exact group name */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  group?: string;
}
