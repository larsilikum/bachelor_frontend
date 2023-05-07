<template>
  <header>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/item/Q13">Item</router-link>
    </nav>
  </header>
  <main>
    <router-view></router-view>
  </main>
</template>

<script setup>
import {onMounted} from "vue";

// request the generated URL with your favorite HTTP request library
onMounted(async () => {
})
</script>

<style scoped>
main {
  background-color: #E8CFCF;
}
</style>
