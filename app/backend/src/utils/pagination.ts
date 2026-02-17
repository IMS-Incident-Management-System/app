import { FindOptions, Model, ModelStatic } from 'sequelize';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedQuery<TFilter = any> {
  filters?: TFilter;
  pagination: PaginationOptions;
}

export async function paginate<T extends Model>(
  model: ModelStatic<T>,
  options: FindOptions<T['_attributes']> & { pagination: PaginationOptions }
): Promise<PaginatedResult<T>> {
  const { pagination, ...findOptions } = options;
  const { page, limit } = pagination;

  const offset = (page - 1) * limit;

  const { count, rows } = await model.findAndCountAll({
    ...findOptions,
    offset,
    limit,
  });

  return {
    items: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
}

// Хелпер для преобразования результата пагинации в формат ITable
export function paginatedResultToTable<T>(
  result: { items: T[]; total: number; page: number; limit: number; totalPages: number },
  columns: Array<{ key: string; title: string; dataIndex: string }>
) {
  return {
    dataSource: result.items,
    total: result.total,
    page: result.page,
    limit: result.limit,
    columns
  };
} 