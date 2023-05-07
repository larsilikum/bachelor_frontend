<template>
  <div v-if="item">
    <h1>{{item.title}}</h1>
    <p>{{item.description}}</p>
  </div>
  <image-filter image-path="src/assets/trump.jpg"></image-filter>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useItemStore} from "../store/index.js";
import {useRoute} from "vue-router";
import ImageFilter from "../components/ImageFilter.vue";

const itemStore = useItemStore()
const getItemById = itemStore.getItemById

const item = ref(undefined)
const route = useRoute()

onMounted(() => {
  // itemStore.fetchItemById(route.params.id)
  // item.value = getItemById(route.params.id)
})
</script>

<style scoped>

</style>