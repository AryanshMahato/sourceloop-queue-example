import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {User} from '../types/user';
import {LoadService} from './load.service';
import {inject} from '@loopback/context';
import {ILogger, LOGGER} from '@sourceloop/core';

@injectable({scope: BindingScope.TRANSIENT})
export class TransformService {
  constructor(
    @service(LoadService) private readonly loadService: LoadService,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {}

  transform(users: User[]) {
    this.logger.info('Transformation started');
    const userNames = users.map(user => user.name);
    this.loadService.load(userNames);
  }
}
