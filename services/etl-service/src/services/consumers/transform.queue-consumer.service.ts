import {AnyObject} from '@loopback/repository';
import {asConsumer, EventsInStream, IConsumer} from '@sourceloop/queue';
import {injectable, service} from '@loopback/core';
import {
  QueueEvent,
  SqsTransformStream,
  topicTransform,
} from '../../types/event-types';
import {TransformService} from '../transform.service';

@injectable(asConsumer)
export class TransformQueueConsumerService
  implements IConsumer<SqsTransformStream, EventsInStream<SqsTransformStream>>
{
  constructor(
    @service(TransformService)
    private transformService: TransformService,
  ) {}
  topic: string = topicTransform;

  event: EventsInStream<SqsTransformStream> = QueueEvent.Transform;

  async handler(payload: AnyObject) {
    console.log('Transform payload', payload);
    if (!payload.users || !Array.isArray(payload.users)) {
      throw new Error('Users are required for transformation');
    }
    await this.transformService.transform(payload.users);
  }
}
