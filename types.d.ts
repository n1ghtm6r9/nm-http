declare module '@nmxjs/redis' {
  class RedisModule {}
  interface IRedisService {
    get(key: string): Promise<any>;
    set(...params): Promise<void>;
  }
  const redisServiceKey: string;
}

declare module '@nmxjs/types' {
  type ProxyDto = any;
  enum ProxyTypeEnum {
    HTTPS,
    SOCKS4,
    SOCKS5,
  }
}
