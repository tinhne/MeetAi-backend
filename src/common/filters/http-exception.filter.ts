import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  // Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error } = this.resolveException(exception);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(error && { error }),
    };

    // Log server errors (5xx) as error, client errors (4xx) as warn
    if (status >= 500) {
      this.winstonLogger.error('Internal Server Error', {
        ...errorResponse,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      this.winstonLogger.warn('Client Error', errorResponse);
    }

    response.status(status).json(errorResponse);
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string | string[];
    error?: string;
  } {
    // NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { status: exception.getStatus(), message: res };
      }
      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        return {
          status: exception.getStatus(),
          message: (obj.message as string | string[]) ?? exception.message,
          error: obj.error as string | undefined,
        };
      }
    }

    // Prisma known request errors (e.g. unique constraint)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    // Prisma validation errors
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Database validation error',
        error: 'Bad Request',
      };
    }

    // Unknown errors
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: `Duplicate value for field: ${String((exception.meta?.target as string[])?.join(', '))}`,
          error: 'Conflict',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
          error: 'Bad Request',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
          error: 'Internal Server Error',
        };
    }
  }
}
