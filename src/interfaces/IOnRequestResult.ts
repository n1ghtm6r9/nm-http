import type { ProxyDto } from '../dto';
import { IOnRequestOptions } from './IOnRequestOptions';

export interface IOnRequestResult extends IOnRequestOptions {
  proxy?: ProxyDto;
}
