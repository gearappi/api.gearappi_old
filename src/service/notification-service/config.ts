import { IServiceConfig } from '../../common/config';

export const Config: IServiceConfig = {
  serviceName: process.env.SERVICE_NAME || 'NotificationService',
  db: {
    type: 'postgres',
    url:
      process.env.DATABASE_URL ||
      'postgres://postgres@127.0.0.1:5432/notification-service',
  },
  nats: {
    url: process.env.NATS_URL || 'nats://127.0.0.1:4222',
  },
};
