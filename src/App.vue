<template>
  <div id="app-container">
      <nav-bar/>
      <router-view :key="$route.fullPath" class="main"></router-view>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import NavBar from "./components/NavBar.vue";
import {useColorStore} from "./store/bg.js";
import {storeToRefs} from "pinia";

const colorStore = useColorStore()
const { getColors } = storeToRefs(colorStore)
// request the generated URL with your favorite HTTP request library
onMounted(async () => {
})
</script>

<style scoped>
#app-container{
  background-color: v-bind(getColors.bg);
}
:deep(*) {
  --bg-col: v-bind(getColors.bg);
  --hi-col: v-bind(getColors.highlight);
}
</style>
