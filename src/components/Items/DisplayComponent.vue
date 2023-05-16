<template>
<div class="frame">
  <image-filter v-if="display.image" :image-path="display.image.url"/>
  <p v-else class="display-type">{{display.text}}</p>
</div>
</template>

<script setup>
import ImageFilter from "./ImageFilter.vue";
defineProps(['display'])
</script>

<style scoped>
.frame {
  width: 100%;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 2px solid black;
}
.display-type {
  font-size: 150px;
  -webkit-text-stroke-width: 0.5em;
}
</style>