export interface FilterCondition {
  $eq?: string | number;
  $regex?: string;
  $between?: [string | number, string | number];
  $gte?: number;
  $lte?: number;
  $isNull?: boolean;
  $isNotNull?: boolean;
}

export type Filter = Record<string, FilterCondition>;

export interface LogicalFilter {
  $and?: Filter[];
  $or?: Filter[];
}

export interface OrderBy {
  sort: string;
  order: "asc" | "desc";
}

export interface Paginate {
  page: number;
  perPage: number;
}

export interface QueryOptions {
  filter?: Filter;
  paginate?: Paginate;
  orderBy?: OrderBy[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}
