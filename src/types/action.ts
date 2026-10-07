export interface ApiResult<T = unknown> {
  status: string;
  message: string;
  data: T;
}