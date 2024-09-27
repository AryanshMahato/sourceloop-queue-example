import {asConsumer, SqsConsumer} from '@sourceloop/queue';
import {injectable, service} from '@loopback/core';
import {QueueEvent} from '../../types/event-types';
import {LoadService} from '../load.service';

type LoadQueuePayload = {
  userNames: string[];
};

@injectable(asConsumer)
export class LoadQueueConsumerService implements SqsConsumer<LoadQueuePayload> {
  constructor(@service(LoadService) private loadService: LoadService) {}

  event = QueueEvent.Load;

  async handler(payload: LoadQueuePayload) {
    console.log('load payload', payload);
    this.validatePayload(payload);
    this.loadService.load(payload.userNames);
  }

  private validatePayload(payload: LoadQueuePayload): void {
    if (!payload.userNames || !Array.isArray(payload.userNames)) {
      throw new Error('User names are required for loading');
    }
  }
}
