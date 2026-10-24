import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const MAPPING: Record<string, { status: HttpStatus; error: string; message: string }> = {
  P2025: { status: HttpStatus.NOT_FOUND, error: 'Not Found', message: 'Record not found' },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
    message: 'Related record not found',
  },
  P2002: { status: HttpStatus.CONFLICT, error: 'Conflict', message: 'Record already exists' },
};

/** Maps known Prisma errors to HTTP errors with the standard { statusCode, message, error } body. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = MAPPING[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
    };
    response
      .status(mapped.status)
      .json({ statusCode: mapped.status, message: mapped.message, error: mapped.error });
  }
}
