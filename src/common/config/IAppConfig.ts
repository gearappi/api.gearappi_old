import { IServiceConfig } from './IServiceConfig';

export interface IAppConfig extends IServiceConfig {
  readonly host: string;
  readonly port: number;
  readonly prefix: string;
}
