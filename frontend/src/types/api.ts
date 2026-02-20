export interface ApiError {
    success: false;
    status: number;
    error: string;
}

export interface ApiSuccess<T> {
    success: true;
    status: number;
    data: T;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export interface PaginatedQuery {
    limit: number;
    offset: number;
}
