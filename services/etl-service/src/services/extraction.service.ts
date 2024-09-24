import {BindingScope, injectable, service} from '@loopback/core';
import {inject} from '@loopback/context';
import {RemoteServiceBindings} from '../bindings';
import {PlaceholderService} from './placeholder.service';
import {ILogger, LOGGER} from '@sourceloop/core';
import {TransformService} from './transform.service';
import {
  QueueEvent,
  SqsTransformStream,
  topicTransform,
} from '../types/event-types';
import {Producer, producer} from '@sourceloop/queue';

@injectable({scope: BindingScope.TRANSIENT})
export class ExtractionService {
  constructor(
    @inject(RemoteServiceBindings.Placeholder)
    private readonly placeholderService: PlaceholderService,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(TransformService)
    private readonly transformService: TransformService,
    @producer(topicTransform)
    private readonly sqsProducer?: Producer<SqsTransformStream>,
  ) {}

  async extract() {
    this.logger.info('Extraction started');
    const users = await this.placeholderService.getUsers();
    if (process.env.ENABLE_SQS === 'true' && this.sqsProducer) {
      await this.sqsProducer.send(QueueEvent.Transform, [{users}]);
      return;
    }
    return this.transformService.transform(users);
  }
}
