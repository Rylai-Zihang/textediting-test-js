<template>
  <div>
    <textarea class="input-field" v-model="text"  @input="onTextChanged"></textarea>
    <p v-text="textFromState"></p>
  </div>
</template>

<script lang="ts">
  import { MutationType } from './store/Store';
  import { Vue, Component, Prop } from "vue-property-decorator";

  @Component
  export default class App extends Vue {

    onTextChanged(event: Event) {
      if (event && event.target) {
        const targetElement = <HTMLTextAreaElement> event.target;
        this.$store.commit(MutationType.UpdateTextOnInput, targetElement.value);
      }
    }

    get text() {
      return this.$store.state.text;
    }
  }
</script>

<style>
  .input-field {
    width: 600px;
    height: 300px;
}
</style>