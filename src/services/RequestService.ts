import * as objHash from 'object-hash';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { parseJson, sleep } from '@nmxjs/utils';
import { redisServiceKey, IRedisService } from '@nmxjs/redis';
import { IRequestResult, IExtendRequestOptions, ProxyTypeEnum } from '../interfaces';
import { httpCachePrefix } from '../constants';

@Injectable()
export class RequestService {
  constructor(@Inject(redisServiceKey) protected readonly redis: IRedisService) {}

  public async call({ timeoutMs = 15000, httpClient, onRequest, onError, ...otherOptions }: IExtendRequestOptions): Promise<IRequestResult> {
    let { method = 'GET', body, headers = {}, query, url, proxy, cacheTttMs } = otherOptions;

    if (onRequest) {
      await onRequest({
        body,
        headers,
        query,
        url,
        method,
      }).then(res => {
        body = res.body;
        method = <any>res.method;
        headers = res.headers;
        query = res.query;
        url = res.url;
        proxy = res.proxy;
      });
    }

    if (cacheTttMs && this.redis) {
      const key = objHash({
        body,
        query,
        url,
        method,
      });

      const cacheResult = await this.redis.get(`${httpCachePrefix}:${key}`).then(res => (res ? JSON.parse(res) : null));

      if (cacheResult) {
        return cacheResult;
      }
    }

    while (true) {
      try {
        const res = await httpClient.request({
          url,
          method,
          params: query,
          headers: Object.keys(headers).reduce((result, key) => {
            if (headers[key] !== undefined) {
              result[key] = headers[key];
            }
            return result;
          }, {}),
          ...(body ? { data: body } : {}),
          ...(timeoutMs ? { timeout: timeoutMs } : {}),
          ...(proxy
            ? {
                ...([ProxyTypeEnum.SOCKS4, ProxyTypeEnum.SOCKS5].includes(proxy.type)
                  ? {
                      httpsAgent: new SocksProxyAgent(
                        `${proxy.type.toLowerCase()}://${proxy.username && proxy.password ? `${proxy.username}:${proxy.password}@` : ''}${proxy.ip}:${
                          proxy.port
                        }`,
                        {
                          timeout: timeoutMs,
                        },
                      ),
                    }
                  : proxy.type === ProxyTypeEnum.HTTPS
                  ? {
                      httpsAgent: new HttpsProxyAgent({
                        host: proxy.ip,
                        port: proxy.port,
                        timeout: timeoutMs,
                        ...(proxy.username && proxy.password
                          ? {
                              auth: `${proxy.username}:${proxy.password}`,
                            }
                          : {}),
                      }),
                    }
                  : {
                      proxy: {
                        host: proxy.ip,
                        port: proxy.port,
                        protocol: proxy.type.toLowerCase(),
                        ...(proxy.username && proxy.password
                          ? {
                              auth: {
                                username: proxy.username,
                                password: proxy.password,
                              },
                            }
                          : {}),
                      },
                    }),
              }
            : {}),
        });

        if (res instanceof Error) {
          throw res;
        }

        if (otherOptions.sleep) {
          await sleep({ time: otherOptions.sleep });
        }

        const result = {
          status: res.status,
          data: parseJson({ data: res.data }) || res.data,
          cached: false,
        };

        if (cacheTttMs && this.redis) {
          const key = objHash({
            body,
            query,
            url,
            method,
          });

          await this.redis.set(
            `${httpCachePrefix}:${key}`,
            JSON.stringify({
              ...result,
              cached: true,
            }),
            {
              PX: cacheTttMs,
            },
          );
        }

        return result;
      } catch (error) {
        if (['socket hang up', 'read ECONNRESET'].includes(error.message)) {
          Logger.warn(`Request ${url}, has ${error.message} error! try again!`);
          continue;
        }

        if (onError) {
          await onError({
            error,
            proxy,
          });
        }

        if (error?.response?.data) {
          throw new Error(JSON.stringify(error.response.data, undefined, 2));
        }

        throw error;
      }
    }
  }
}
