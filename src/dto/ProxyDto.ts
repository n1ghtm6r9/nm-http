import { Field } from '@nmxjs/validation';
import { ProxyTypeEnum } from '../interfaces';

export class ProxyDto {
  @Field({
    type: String,
  })
  ip: string;

  @Field({
    type: Number,
  })
  port: number;

  @Field({
    type: { ProxyTypeEnum },
    enum: true,
  })
  type: ProxyTypeEnum;

  @Field({
    type: String,
    nullable: true,
  })
  username?: string;

  @Field({
    type: String,
    nullable: true,
  })
  password?: string;
}
