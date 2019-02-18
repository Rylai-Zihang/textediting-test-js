import { Application } from './application/Application';
import { TextSynchronizer } from './text-synchronization/TextSynchronizer';

const serverHost: string = window.location.hostname;
const serverPort: number = 3000;
const rootElementSelector: string = '#app';
const TEXT_MAX_LENGTH = 60_000;

TextSynchronizer.create(serverHost, serverPort, TEXT_MAX_LENGTH)
  .then((synchronizer: TextSynchronizer) => {
    const app = new Application(rootElementSelector, TEXT_MAX_LENGTH);
    app.initialize(synchronizer);
  });
