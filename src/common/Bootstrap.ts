import {
  INestApplication,
  INestMicroservice,
  Logger,
  LoggerService,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RpcException, Transport } from '@nestjs/microservices';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { IAppConfig, IServiceConfig } from './config';

export class Bootstrap {
  public static app(module: any, config: IAppConfig, logger?: LoggerService) {
    const appLogger = logger || new Logger(config.serviceName, true);

    this.appBootstrap(module, config, appLogger).catch(appLogger.error);
  }

  public static service(
    module: any,
    config: IServiceConfig,
    logger?: LoggerService,
  ) {
    const serviceLogger = logger || new Logger(config.serviceName, true);

    this.serviceBootstrap(module, config, serviceLogger).catch(
      serviceLogger.error,
    );
  }

  public static hybrid(
    module: any,
    config: IAppConfig,
    logger?: LoggerService,
  ) {
    const serviceLogger = logger || new Logger(config.serviceName, true);

    this.hybridBootstrap(module, config, serviceLogger).catch(
      serviceLogger.error,
    );
  }

  private static readonly validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: {
      target: false,
      value: false,
    },
    exceptionFactory: errors => new RpcException(errors),
  });

  private static async appBootstrap(
    module: any,
    config: IAppConfig,
    logger?: LoggerService,
  ): Promise<INestApplication> {
    const app = await NestFactory.create(module, new FastifyAdapter());

    app.enableCors();
    app.setGlobalPrefix(config.prefix);
    app.useGlobalPipes(this.validationPipe);

    useContainer(app.select(module), {
      fallbackOnErrors: true,
    });

    if (!!logger) {
      app.useLogger(logger);
    }

    const swaggerDocumentBuilder = new DocumentBuilder()
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'header',
      )
      .setBasePath(config.prefix)
      .setTitle(config.serviceName)
      .setVersion('1.0');

    const swaggerDocument = SwaggerModule.createDocument(
      app,
      swaggerDocumentBuilder.build(),
    );

    SwaggerModule.setup(config.prefix, app, swaggerDocument);

    await app.listen(config.port, config.host, () => {
      if (!!logger) {
        logger.log(`${config.serviceName} app started.`);
      }
    });

    return app;
  }

  private static async hybridBootstrap(
    module: any,
    config: IAppConfig,
    logger?: LoggerService,
  ): Promise<INestApplication> {
    const app = await this.appBootstrap(module, config, logger);
    const service = app.connectMicroservice({
      transport: Transport.NATS,
      options: config.nats,
    });

    service.listen(() => {
      if (!!logger) {
        logger.log(`${config.serviceName} service started.`);
      }
    });

    return app;
  }

  private static async serviceBootstrap(
    module: any,
    config: IServiceConfig,
    logger?: LoggerService,
  ): Promise<INestMicroservice> {
    const service = await NestFactory.createMicroservice(module, {
      transport: Transport.TCP,
    //   options: config.nats,
    });

    service.useGlobalPipes(this.validationPipe);

    useContainer(service.select(module), {
      fallbackOnErrors: true,
    });

    if (!!logger) {
      service.useLogger(logger);
    }

    await service.listen(() => {
      if (!!logger) {
        logger.log(`${config.serviceName} service started.`);
      }
    });

    return service;
  }
}
