import { Application } from './application/Application';
import { TextSynchronizer } from './text-synchronization/TextSynchronizer';

const serverHost: string = window.location.hostname;
const serverPort: number = 3000;
const rootElementSelector: string = '#app';

TextSynchronizer.create(serverHost, serverPort)
  .then((synchronizer: TextSynchronizer) => {
    const app = new Application();
    app.initialize(rootElementSelector, synchronizer);
  });
