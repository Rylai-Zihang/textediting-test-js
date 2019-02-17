import State from './State';

import vue from 'vue';
import vuex, { StoreOptions, MutationTree, ActionTree, Plugin } from 'vuex';

vue.use(vuex);

export enum MutationType {
  UpdateTextOnInput = 'UpdateTextOnInput',
  UpdateTextOnReceive = 'UpdateTextOnReceive',
}

const mutations: MutationTree<State> = {
  [MutationType.UpdateTextOnInput]: (state: State, newText: string) => {
    state.text = newText;
  },
  [MutationType.UpdateTextOnReceive]: (state: State, newText: string) => {
    state.text = newText;
  },
};

export default class Store  extends vuex.Store<State> {

  public constructor(plugins: Plugin<State>[] = []) {

    const storeOptions: StoreOptions<State> = {
      mutations,
      plugins,
      state: new State(),
    };

    super(storeOptions);
  }
}
