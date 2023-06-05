<template>
  <HomeBackground class="background"/>
  <h1>Communi<br>
    cating <br>
    Hate</h1>
</template>

<script setup>

import HomeBackground from "../components/HomeBackground.vue";
</script>

<style scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
h1 {
  font-size: 19vw;
  line-height: 1;
  text-align: right;
  font-weight: 300;
  margin-top: 0;
  word-break: break-word;
  text-transform: uppercase;
  color: #C73C00;
  mix-blend-mode: difference;
}
</style>
