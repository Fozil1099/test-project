import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const MAX_INT4 = 2_147_483_647;

/** Parses a positive int4 id; rejects values Postgres SERIAL can't hold. */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = /^\d+$/.test(value) ? Number(value) : NaN;
    if (!Number.isSafeInteger(id) || id < 1 || id > MAX_INT4) {
      throw new BadRequestException('id must be a positive integer');
    }
    return id;
  }
}
