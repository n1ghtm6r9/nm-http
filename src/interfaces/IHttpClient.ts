import { ICreateHttpClientOptions } from './ICreateHttpClientOptions';
import { IRequestOptions } from './IRequestOptions';
import { IRequestResult } from './IRequestResult';

export interface IHttpClient {
  request<T = any>(options: IRequestOptions): Promise<IRequestResult<T>>;
  createHttpClient(options: ICreateHttpClientOptions): IHttpClient;
}
