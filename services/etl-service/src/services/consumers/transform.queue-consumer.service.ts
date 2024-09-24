import {AnyObject} from '@loopback/repository';
import {asConsumer, EventsInStream, IConsumer} from '@sourceloop/queue';
import {injectable} from '@loopback/core';
import {
  eventTransform,
  SqsTransformStream,
  topicTransform,
} from '../../types/event-types';

@injectable(asConsumer)
export class TransformQueueConsumerService
  implements IConsumer<SqsTransformStream, EventsInStream<SqsTransformStream>>
{
  topic: string = topicTransform;

  event: EventsInStream<SqsTransformStream> = eventTransform;

  async handler(payload: AnyObject) {
    console.log('payload', payload);
  }
}
