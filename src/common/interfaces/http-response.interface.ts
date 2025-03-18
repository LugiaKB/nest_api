export interface IHttpResponse<T> {
  success: boolean;
  data: T;
  meta?: IPaginationMeta | null;
  error?: string | null;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedData<T> {
  data: T[];
  meta: IPaginationMeta;
}

export interface IErrorResponse {
  message: string;
  details?: Record<string, unknown>;
}
