import type { ProxyDto } from '../dto';

export interface IOnErrorOptions {
  error: Error;
  proxy?: ProxyDto;
}
