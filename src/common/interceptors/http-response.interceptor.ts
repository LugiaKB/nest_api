import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IHttpResponse,
  IPaginatedData,
  IPaginationMeta,
} from '../interfaces/http-response.interface';

type ResponseType<T> = T | IPaginatedData<T>;

@Injectable()
export class HttpResponseInterceptor<T>
  implements NestInterceptor<T, IHttpResponse<T | T[]>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IHttpResponse<T | T[]>> {
    return next.handle().pipe(
      map((response: ResponseType<T>) => {
        if (this.isPaginatedResponse(response)) {
          return {
            success: true,
            data: response.data,
            meta: response.meta,
            error: null,
          };
        }

        return {
          success: true,
          data: response,
          meta: null,
          error: null,
        };
      }),
    );
  }

  private isPaginatedResponse(
    response: ResponseType<T>,
  ): response is IPaginatedData<T> {
    const meta = (response as IPaginatedData<T>).meta;
    return (
      response !== null &&
      typeof response === 'object' &&
      'data' in response &&
      'meta' in response &&
      Array.isArray(response.data) &&
      this.isValidPaginationMeta(meta)
    );
  }

  private isValidPaginationMeta(meta: unknown): meta is IPaginationMeta {
    return (
      meta !== null &&
      typeof meta === 'object' &&
      'total' in meta &&
      'page' in meta &&
      'limit' in meta &&
      'pages' in meta &&
      typeof (meta as IPaginationMeta).total === 'number' &&
      typeof (meta as IPaginationMeta).page === 'number' &&
      typeof (meta as IPaginationMeta).limit === 'number' &&
      typeof (meta as IPaginationMeta).pages === 'number'
    );
  }
}
