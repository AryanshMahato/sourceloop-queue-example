import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {inject} from '@loopback/context';
import {RemoteServiceBindings} from '../bindings';
import {PlaceholderService} from './placeholder.service';
import {ILogger, LOGGER} from '@sourceloop/core';
import {TransformService} from './transform.service';

@injectable({scope: BindingScope.TRANSIENT})
export class ExtractionService {
  constructor(
    @inject(RemoteServiceBindings.Placeholder)
    private readonly placeholderService: PlaceholderService,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(TransformService)
    private readonly transformService: TransformService,
  ) {}

  async extract() {
    this.logger.info('Extraction started');
    const users = await this.placeholderService.getUsers();
    this.transformService.transform(users);
  }
}
