// TODO: Add Babel transpiler to webpack configuration to support older browsers
import { TextDiffCalculator } from 'diff-calculator';
import { TextManager } from './TextManager';
import { TextView } from './TextView';
import { TextWebStoreClient } from 'communication';

// TODO: Handle errors on initialization.
const diffCalculator = new TextDiffCalculator();
const view = new TextView();

TextWebStoreClient.connect(`${window.location.hostname}:3000`)
  .then((storeClient) => {
    const textManager = new TextManager(view, storeClient, diffCalculator);
  });
