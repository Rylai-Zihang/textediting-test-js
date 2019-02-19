<template>
  <div>
    <textarea class="input-field" v-model="text"></textarea>
  </div>
</template>

<script lang="ts">
  import { MutationType } from '../state/Store';

  import { Vue, Component, Prop } from "vue-property-decorator";

  @Component
  export default class RootComponent extends Vue {

    get text() {
      return this.$store.state.text;
    }

    set text(value: string) {
      this.$store.commit(MutationType.UpdateTextOnInput, value);
    }
  }
</script>

<style>
  .input-field {
    width: 600px;
    height: 300px;
}
</style>