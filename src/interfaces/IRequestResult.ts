export interface IRequestResult<T = any> {
  status: number;
  data: T;
  cached: boolean;
}
