import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {inject} from '@loopback/context';
import {ILogger, LOGGER} from '@sourceloop/core';
import * as fs from 'node:fs';
import path from 'path';

@injectable({scope: BindingScope.TRANSIENT})
export class LoadService {
  constructor(@inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger) {}
  private fileDirectory = 'out';

  private get filePath() {
    return path.join('out', 'user-names.txt');
  }

  private writeFile(content: string) {
    if (!fs.existsSync(this.fileDirectory)) {
      fs.mkdirSync(this.fileDirectory);
      this.logger.info(`Directory '${this.fileDirectory}' created.`);
    }

    fs.writeFileSync(this.filePath, content);
  }

  load(userNames: string[]) {
    this.logger.info('Loading started');
    this.writeFile(userNames.join(', '));
    this.logger.info('Loading completed');
  }
}
