import { Request } from 'express';

export interface PaginationRequest {
  page?: any;
  size?: any;
  search?: string;
  sort?: string;
  sortOrder?: 'ASC' | 'DESC';
  [k: string]: any;
}

export interface TPaginationRequest extends Request {
  query: {
    limit: string;
    page: string;
    orderBy: string;
    sortBy: string;
    filterBy: string;
    category: string;
    search: string;
    content: string;
    role: string;
    sort: string;
    fields: string;
  };
}

export interface TPaginationResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface IRequestObject {
  type: string;
  description: string;
  url: string;
}
