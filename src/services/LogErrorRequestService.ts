import { Injectable, Logger } from '@nestjs/common';
import { parseJson } from '@nmxjs/utils';

@Injectable()
export class LogErrorRequestService {
  public call(error) {
    const config = error.response?.config || error.config;
    if (!config) {
      return;
    }

    Logger.log(
      `HTTP Client Has Error\nRequest: ${config.method.toUpperCase()} ${config.url}\n${JSON.stringify(
        {
          query: config.params,
          body: parseJson({ data: config.data }) || config.data,
          headers: config.headers,
          error: error.message,
        },
        null,
        '\t'
      )}\n${
        !error.response
          ? ''
          : `Response: ${error.response.status} ${error.response.statusText}\n${JSON.stringify(
              {
                body: error.response.data,
                headers: error.response.headers,
              },
              null,
              '\t'
            )}`
      }`
    );
  }
}
