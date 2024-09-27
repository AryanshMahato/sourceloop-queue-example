import {asConsumer, SqsConsumer} from '@sourceloop/queue';
import {injectable, service} from '@loopback/core';
import {QueueEvent} from '../../types/event-types';
import {TransformService} from '../transform.service';
import {User} from '../../types/user';

type TransformQueuePayload = {
  users: User[];
};

@injectable(asConsumer)
export class TransformQueueConsumerService
  implements SqsConsumer<TransformQueuePayload>
{
  constructor(
    @service(TransformService)
    private transformService: TransformService,
  ) {}
  event = QueueEvent.Transform;

  async handler(payload: TransformQueuePayload) {
    console.log('Transform payload', payload);
    this.validatePayload(payload);
    await this.transformService.transform(payload.users);
  }

  private validatePayload(payload: TransformQueuePayload): void {
    if (!payload.users || !Array.isArray(payload.users)) {
      throw new Error('Users are required for transformation');
    }
  }
}
