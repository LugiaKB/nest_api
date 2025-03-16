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

type ExceptionResponse = {
  message?: string;
  error?: Record<string, unknown>;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const errorResponse = this.buildErrorResponse(exception);
    const status = this.getStatusCode(exception);

    response.status(status).json({
      success: false,
      data: null,
      error: errorResponse,
    });
  }

  private buildErrorResponse(exception: unknown): IErrorResponse {
    if (exception instanceof ApplicationError) {
      return {
        message: exception.message,
        ...(exception.error &&
          this.isValidErrorDetails(exception.error) && {
            details: exception.error,
          }),
      };
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (this.isObjectResponse(exceptionResponse)) {
        const response = exceptionResponse as ExceptionResponse;
        return {
          message: this.extractMessage(response, exception.message),
          ...(response.error &&
            this.isValidErrorDetails(response.error) && {
              details: response.error,
            }),
        };
      }
    }

    return { message: 'Internal server error' };
  }

  private extractMessage(
    response: ExceptionResponse,
    defaultMessage: string,
  ): string {
    return (
      (typeof response.message === 'string' && response.message) ||
      (typeof response.error === 'string' && response.error) ||
      defaultMessage
    );
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof ApplicationError) {
      return exception.statusCode;
    }

    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private isObjectResponse(response: unknown): boolean {
    return typeof response === 'object' && response !== null;
  }

  private isValidErrorDetails(
    error: unknown,
  ): error is Record<string, unknown> {
    return typeof error === 'object' && error !== null;
  }
}
