import {IStreamDefinitionSQS} from '@sourceloop/queue';
import {AnyObject} from '@loopback/repository';

export enum QueueEvent {
  Transform = 'Transform',
  Load = 'Load',
}

export enum QueueGroup {
  All = 'all',
}

export const topicTransform = 'Transform';

export interface SqsTransformStream extends IStreamDefinitionSQS {
  queueUrl: string;
  topic: string;
  messages: {
    [key: string]: AnyObject;
  };
}
