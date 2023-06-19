<template>
  <poster-background class="background" min-size="1" max-size="250"/>
  <poster-background class="background" min-size="250" max-size="1000"/>
</template>

<script setup>
import PosterBackground from "../components/PosterBackground.vue";
</script>

<style scoped>
.background {
  width: 2376mm;
  height: 3364mm;
  break-before: page;
}
@page  {
  size: 2376mm 3364mm;
  margin: 0;
}
</style>