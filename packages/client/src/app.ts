// TODO: Add Babel transpiler to webpack configuration to support older browsers
import { TextDiffCalculator } from 'diff-calculator';
import { TextManager } from './TextManager';
import { TextView } from './TextView';
import { WebClient } from 'communication';

// TODO: Handle errors on initialization.
const diffCalculator = new TextDiffCalculator();
const view = new TextView();
let textManager = null;

WebClient.connect(window.location.hostname, 3000)
  .then((connection) => {
    textManager = new TextManager(view, connection, diffCalculator);
  });
