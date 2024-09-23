// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {post} from '@loopback/openapi-v3';
import {authorize} from 'loopback4-authorization';
import {inject} from '@loopback/context';
import {ILogger, LOGGER} from '@sourceloop/core';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {service} from '@loopback/core';
import {ExtractionService} from '../services';

export class ExtractionController {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(ExtractionService)
    private readonly extractionService: ExtractionService,
  ) {}

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @post('/extraction')
  async extract() {
    await this.extractionService.extract();
  }
}
