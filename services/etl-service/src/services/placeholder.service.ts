import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {PlaceholderDataSource} from '../datasources';
import {User} from '../types';

export interface PlaceholderService {
  getUsers(): Promise<User[]>;
}

export class PlaceholderProvider implements Provider<PlaceholderService> {
  constructor(
    // placeholder must match the name property in the datasource json file
    @inject('datasources.placeholder')
    protected dataSource: PlaceholderDataSource = new PlaceholderDataSource(),
  ) {}

  value(): Promise<PlaceholderService> {
    return getService(this.dataSource);
  }
}
