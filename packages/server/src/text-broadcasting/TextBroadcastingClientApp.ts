import { ClientApplication } from '../http/ClientApplication';

import * as path from 'path';

const CHAT_CLIENT_DIR = path.join(__dirname, '../../node_modules/client/dist');
const CHAT_CLIENT_ENTRY_POINT = 'app.html';

export class TextBroadcastingClientApp implements ClientApplication {

  getClientAppDirectory(): string {
    return CHAT_CLIENT_DIR;
  }

  getClientAppEntryPointName(): string {
    return CHAT_CLIENT_ENTRY_POINT;
  }
}
