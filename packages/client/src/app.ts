// TODO: Add Babel transpiler to webpack configuration to support older browsers
import { TextManager } from './TextManager';
import { TextView } from './TextView';

// TODO: Handle errors on initialization.
const view = new TextView();
TextManager.create(view, window.location.hostname, 3000);
