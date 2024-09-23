import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './placeholder.config.json';

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PlaceholderDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'placeholder';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.placeholder', {optional: true})
    dsConfig: object = config,
  ) {
    const dsConfigJson = {
      ...dsConfig,
      options: {
        baseUrl: process.env.PLACEHOLDER_SERVICE_URL,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
      },
    };
    super(dsConfigJson);
  }
}
