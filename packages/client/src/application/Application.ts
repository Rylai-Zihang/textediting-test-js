/* tslint:disable:import-name */
import Vue from 'vue';
import RootComponent from './RootComponent.vue';

import { Store, MutationType } from '../state/Store';
import { TextSynchronizer } from '../text-synchronization/TextSynchronizer';
import { Plugin, MutationPayload } from 'vuex';
import { State } from '../state/State';

export class Application {

  // TODO: Do not allow to enter more than "textMaxLength" symbols on view.
  public constructor(private rootElementSelector: string, private textMaxLength: number) {
  }

  public initialize(synchronizer: TextSynchronizer) {
    const synchronizerPlugin: Plugin<State> = this.createTextSynchronizerPlugin(synchronizer);
    this.initApp(this.rootElementSelector, synchronizerPlugin);
  }

  private createTextSynchronizerPlugin(synchronizer: TextSynchronizer): Plugin<State> {
    return (store: Store) => {

      synchronizer.subscribeToTextUpdatesFromServer((text:string) => {
        store.commit(MutationType.UpdateTextOnReceive, text);
      });

      store.subscribe((mutation: MutationPayload, state: State) => {
        if (mutation.type === MutationType.UpdateTextOnInput) {
          synchronizer.onTextChangedOnClient(state.text);
        }
      });
    };
  }

  private initApp(rootElementSelector: string, synchronizerPlugin: Plugin<State>) {
    new Vue({
      store: new Store([synchronizerPlugin]),
      render: h => h(RootComponent),
    }).$mount(rootElementSelector);
  }
}
