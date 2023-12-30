import axios, { Axios, AxiosRequestConfig } from 'axios';
import { Agent as HTTPSAgent } from 'https';
import { Agent as HTTPAgent } from 'http';
import { Global, Module } from '@nestjs/common';
import { objToQs } from '@nmxjs/utils';
import { RedisModule } from '@nmxjs/redis';
import { axiosHttpClientKey, axiosHttpClientOptionsKey, httpClientKey } from './constants';
import { ICreateHttpClientOptions, IHttpClient, IRequestOptions } from './interfaces';
import * as Services from './services';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    ...Object.values(Services),
    {
      provide: axiosHttpClientOptionsKey,
      useFactory: (): AxiosRequestConfig => ({
        paramsSerializer: params => objToQs({ obj: params }),
        httpAgent: new HTTPAgent({ keepAlive: true }),
        httpsAgent: new HTTPSAgent({ keepAlive: true }),
      }),
    },
    {
      provide: axiosHttpClientKey,
      useFactory: (options: AxiosRequestConfig, logErrorRequestService: Services.LogErrorRequestService): Axios => {
        const httpClient = axios.create(options);
        httpClient.interceptors.response.use(undefined, logErrorRequestService.call);
        return httpClient;
      },
      inject: [axiosHttpClientOptionsKey, Services.LogErrorRequestService],
    },
    {
      provide: httpClientKey,
      useFactory: (
        httpClient: Axios,
        options: AxiosRequestConfig,
        requestService: Services.RequestService,
        logErrorRequestService: Services.LogErrorRequestService,
      ): IHttpClient => {
        const createHttpClient = (createOptions: ICreateHttpClientOptions) => {
          const newHttpClient = axios.create(options);
          newHttpClient.interceptors.response.use(undefined, error => {
            logErrorRequestService.call(error);
            return error;
          });
          return {
            request: (requestOptions: IRequestOptions) =>
              requestService.call({
                ...requestOptions,
                ...(createOptions.url
                  ? {
                      url: `${createOptions.url}${requestOptions.url}`,
                    }
                  : {}),
                httpClient: newHttpClient,
                onRequest: createOptions.onRequest,
                onError: createOptions.onError,
              }),
            createHttpClient,
          };
        };
        return {
          request: (requestOptions: IRequestOptions) =>
            requestService.call({
              ...requestOptions,
              httpClient,
            }),
          createHttpClient,
        };
      },
      inject: [axiosHttpClientKey, axiosHttpClientOptionsKey, Services.RequestService, Services.LogErrorRequestService],
    },
  ],
  exports: [httpClientKey],
})
export class HttpClientModule {}
