import type { ProxyDto } from '@nmxjs/types';
import { IOnRequestOptions } from './IOnRequestOptions';

export interface IOnRequestResult extends IOnRequestOptions {
  proxy?: ProxyDto;
}
