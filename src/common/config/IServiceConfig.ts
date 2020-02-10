import { NatsOptions } from '@nestjs/microservices';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export interface IServiceConfig {
  readonly serviceName: string;
  readonly db: PostgresConnectionOptions;
  readonly nats: NatsOptions['options'];
}
