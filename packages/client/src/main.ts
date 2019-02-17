/* tslint:disable:import-name */
import Vue from 'vue';
import App from './App.vue';

import Store, { MutationType } from './store/Store';
import { TextManager } from './TextManager';
import { Plugin, MutationPayload } from 'vuex';
import State from './store/State';

TextManager.create(window.location.hostname, 3000)
  .then((textManager: TextManager) => {
    const textManagerPlugin = createTextManagerPlugin(textManager);
    initApp(textManagerPlugin);
  });

function createTextManagerPlugin(textManager: TextManager): Plugin<State> {
  return (store: Store) => {

    textManager.subscribeToTextChanges((text:string) => {
      store.commit(MutationType.UpdateTextOnReceive, text);
    });

    store.subscribe((mutation: MutationPayload, state: State) => {
      if (mutation.type === MutationType.UpdateTextOnInput) {
        textManager.onTextChanged(state.text);
      }
    });
  };
}

function initApp(textManagerPlugin: Plugin<State>) {
  new Vue({
    store: new Store([textManagerPlugin]),
    render: h => h(App),
  }).$mount('#app');
}
