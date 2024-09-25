import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {AuthenticationComponent} from 'loopback4-authentication';
import {
  AuthorizationBindings,
  AuthorizationComponent,
} from 'loopback4-authorization';
import {
  BearerVerifierBindings,
  BearerVerifierComponent,
  BearerVerifierConfig,
  BearerVerifierType,
  CoreComponent,
  SECURITY_SCHEME_SPEC,
  ServiceSequence,
  SFCoreBindings,
} from '@sourceloop/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import * as openapi from './openapi.json';
import {PlaceholderProvider} from './services';
import {RemoteServiceBindings} from './bindings';
import {
  MessageBusQueueConnectorsComponent,
  SqsClientBindings,
} from '@sourceloop/queue';
import {topicTransform} from './types/event-types';

export {ApplicationConfig};

export class EtlServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    const maxNumberOfMessages = +(process.env.MAX_NUMBER_OF_MESSAGES ?? 10);
    const waitTimeSeconds = +(process.env.WAIT_TIME_SECONDS ?? 20);
    const port = 3000;
    dotenv.config();
    dotenvExt.load({
      schema: '.env.example',
      errorOnMissing: process.env.NODE_ENV !== 'test',
      includeProcessEnv: true,
    });
    options.rest = options.rest ?? {};
    options.rest.basePath = process.env.BASE_PATH ?? '';
    options.rest.port = +(process.env.PORT ?? port);
    options.rest.host = process.env.HOST;
    options.rest.openApiSpec = {
      endpointMapping: {
        [`${options.rest.basePath}/openapi.json`]: {
          version: '3.0.0',
          format: 'json',
        },
      },
    };

    super(options);

    // To check if monitoring is enabled from env or not
    const enableObf = !!+(process.env.ENABLE_OBF ?? 0);
    // To check if authorization is enabled for swagger stats or not
    const authentication =
      process.env.SWAGGER_USER && process.env.SWAGGER_PASSWORD ? true : false;
    const obj = {
      enableObf,
      obfPath: process.env.OBF_PATH ?? '/obf',
      openapiSpec: openapi,
      authentication: authentication,
      swaggerUsername: process.env.SWAGGER_USER,
      swaggerPassword: process.env.SWAGGER_PASSWORD,
    };
    this.bind(SFCoreBindings.config).to(obj);
    this.component(CoreComponent);

    // Set up the custom sequence
    this.sequence(ServiceSequence);

    // Add authentication component
    this.component(AuthenticationComponent);

    // Add bearer verifier component
    this.bind(BearerVerifierBindings.Config).to({
      type: BearerVerifierType.service,
      useSymmetricEncryption: true,
    } as BearerVerifierConfig);
    this.component(BearerVerifierComponent);
    // Add authorization component
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer', '/openapi.json'],
    });
    this.component(AuthorizationComponent);
    this.bind(RemoteServiceBindings.Placeholder).toProvider(
      PlaceholderProvider,
    );

    if (process.env.ENABLE_SQS === 'true') {
      // this.bind(QueueBindings.Config).to({
      //   provider: 'sqs|redis',
      // })
      this.bind(SqsClientBindings.SqsClient).to(
        options.sqsConfig ?? {
          initObservers: true,
          clientConfig: {
            region: process.env.AWS_REGION,
            credentials: {
              accessKeyId: process.env.AWS_SECRET_ACCESS_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            maxAttempts: 3,
            retryMode: 'standard',
          },

          queueUrl: process.env.SQS_QUEUE_URL,
          groupId: process.env.SQS_GROUP_ID ?? 'etl-group',
          maxNumberOfMessages: maxNumberOfMessages,
          waitTimeSeconds: waitTimeSeconds,
          topics: [topicTransform],
        },
      );

      this.component(MessageBusQueueConnectorsComponent);
    }

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.api({
      openapi: '3.0.0',
      info: {
        title: 'etl-service',
        version: '1.0.0',
      },
      paths: {},
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      servers: [{url: '/'}],
    });
  }
}
