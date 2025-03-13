import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from '../errors/application.errors';
import { IErrorResponse } from '../interfaces/http-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: Record<string, unknown> | undefined;

    if (exception instanceof ApplicationError) {
      status = exception.statusCode;
      message = exception.message;
      errorDetails = exception.error as Record<string, unknown>;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const { message: responseMessage, error } = exceptionResponse as Record<
          string,
          unknown
        >;
        message =
          (responseMessage as string) || (error as string) || exception.message;
        errorDetails = error as Record<string, unknown>;
      } else {
        message = exception.message;
      }
    }

    const errorResponse: IErrorResponse = {
      message,
      ...(errorDetails && { details: errorDetails }),
    };

    response.status(status).json({
      success: false,
      data: null,
      error: errorResponse,
    });
  }
}
