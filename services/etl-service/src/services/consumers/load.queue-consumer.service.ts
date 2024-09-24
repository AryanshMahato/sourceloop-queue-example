import {AnyObject} from '@loopback/repository';
import {asConsumer, EventsInStream, IConsumer} from '@sourceloop/queue';
import {injectable, service} from '@loopback/core';
import {
  QueueEvent,
  SqsTransformStream,
  topicTransform,
} from '../../types/event-types';
import {LoadService} from '../load.service';

@injectable(asConsumer)
export class LoadQueueConsumerService
  implements IConsumer<SqsTransformStream, EventsInStream<SqsTransformStream>>
{
  constructor(@service(LoadService) private loadService: LoadService) {}

  topic: string = topicTransform;

  event: EventsInStream<SqsTransformStream> = QueueEvent.Load;

  async handler(payload: AnyObject) {
    console.log('load payload', payload);
    if (!payload.userNames || !Array.isArray(payload.userNames)) {
      throw new Error('User names are required for loading');
    }
    this.loadService.load(payload.userNames);
  }
}
