<template>
  <div id="app">
    <Header></Header>
    <router-view class="view"></router-view>
  </div>
</template>

<script>
import Header from "./components/Header";

export default {
  components: {
    Header
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>