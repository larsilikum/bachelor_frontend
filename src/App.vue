<template>
  <header>
    <nav-bar/>
  </header>
  <main>
    <router-view></router-view>
  </main>
</template>

<script setup>
import {onMounted} from "vue";
import NavBar from "./components/NavBar.vue";

// request the generated URL with your favorite HTTP request library
onMounted(async () => {
})
</script>

<style scoped>
main {
  margin-top: 50px;
}
</style>
