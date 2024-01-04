import type { ProxyDto } from '@nmxjs/types';

export interface IRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, any>;
  body?: Record<string, any>;
  headers?: Record<string, any>;
  sleep?: number;
  timeoutMs?: number;
  proxy?: ProxyDto;
  cacheTttMs?: number;
}
