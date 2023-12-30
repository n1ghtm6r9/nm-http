import { IOnErrorOptions } from './IOnErrorOptions';
import { IOnRequestOptions } from './IOnRequestOptions';
import { IOnRequestResult } from './IOnRequestResult';

export interface ICreateHttpClientOptions {
  url?: string;
  onRequest?(data: IOnRequestOptions): Promise<IOnRequestResult>;
  onError?(options: IOnErrorOptions): void;
}
