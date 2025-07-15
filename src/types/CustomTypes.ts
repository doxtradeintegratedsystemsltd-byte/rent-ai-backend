import { Request } from 'express';

export interface PaginationRequest {
  page?: any;
  size?: any;
  search?: string;
  sort?: string;
  sortOrder?: 'ASC' | 'DESC';
  [k: string]: any;
}

export interface TPaginationResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
