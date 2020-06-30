<template>
  <div class="home">主页
    <div v-for="item in items" :key="item.name">{{item.name}}</div>
  </div>
</template>

<script>
export default {
  asyncData({ store, route }) {
    return store.dispatch("fetchItem", route.params.id);
  },
  computed: {
    items() {
      return this.$store.state.items;
    }
  }
};
</script>

<style>
</style>