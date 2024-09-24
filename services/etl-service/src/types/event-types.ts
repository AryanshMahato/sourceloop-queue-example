import {IStreamDefinitionSQS} from '@sourceloop/queue';
import {AnyObject} from '@loopback/repository';
export const eventTransform = 'Transformed';
export const topicTransform = 'Transform';

export interface SqsTransformStream extends IStreamDefinitionSQS {
  queueUrl: string;
  topic: string;
  messages: {
    [eventTransform]: AnyObject;
  };
}
