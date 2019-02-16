<template>
  <textarea v-model="text" class="input-field"></textarea>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from "vue-property-decorator";

  @Component
  export default class App extends Vue {
    @Prop() text: string = '';
  }
</script>

<style>
  .input-field {
    width: 600px;
    height: 300px;
}
</style>