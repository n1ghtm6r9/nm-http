import { Axios } from 'axios';
import { IRequestOptions } from './IRequestOptions';
import { ICreateHttpClientOptions } from './ICreateHttpClientOptions';

export interface IExtendRequestOptions extends IRequestOptions, Omit<ICreateHttpClientOptions, 'url'> {
  httpClient: Axios;
}
