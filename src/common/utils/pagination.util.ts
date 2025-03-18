import { IPaginatedData } from '../interfaces/http-response.interface';

export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  orderBy?: string,
  order?: 'asc' | 'desc',
): IPaginatedData<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      orderBy,
      order,
    },
  };
}
