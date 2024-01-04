import type { ProxyDto } from '@nmxjs/types';

export interface IOnErrorOptions {
  error: Error;
  proxy?: ProxyDto;
}
