<template>
  <div class="container">
    <sticker-background class="sticker" index="2"/>
  </div>
</template>

<script setup>
import StickerBackground from "../components/StickerBackground.vue";
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
}
  .sticker {
    width: 344mm;
    height: 344mm;
    border: 2px solid black;
  }
</style>