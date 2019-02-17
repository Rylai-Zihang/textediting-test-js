<template>
  <textarea class="input-field" v-model="text"  v-on:input="onTextChanged()"></textarea>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";
  import { TextManager } from './TextManager';

  @Component
  export default class App extends Vue {
    @Prop() text: string = '';
    textManager!: TextManager;

    async mounted() {
      this.textManager = await TextManager.create(window.location.hostname, 3000);
      this.textManager.subscribeToTextChanges((text: string) => {
        this.text = text;
      });
    }

    onTextChanged() {
      this.textManager.onTextChanged(this.text);
    }
  }
</script>

<style>
  .input-field {
    width: 600px;
    height: 300px;
}
</style>