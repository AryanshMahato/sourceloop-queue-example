import {BindingScope, injectable, service} from '@loopback/core';
import {User} from '../types/user';
import {LoadService} from './load.service';
import {inject} from '@loopback/context';
import {ILogger, LOGGER} from '@sourceloop/core';
import {QueueEvent, SqsTransformStream} from '../types/event-types';
import {Producer, producer} from '@sourceloop/queue';

@injectable({scope: BindingScope.TRANSIENT})
export class TransformService {
  constructor(
    @service(LoadService) private readonly loadService: LoadService,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @producer()
    private readonly sqsProducer?: Producer<SqsTransformStream>,
  ) {}

  async transform(users: User[]) {
    this.logger.info('Transformation started');
    const userNames = users.map(user => user.name);
    if (process.env.ENABLE_SQS === 'true' && this.sqsProducer) {
      await this.sqsProducer.send(QueueEvent.Load, [{userNames}]);
      return;
    }
    this.loadService.load(userNames);
  }
}
