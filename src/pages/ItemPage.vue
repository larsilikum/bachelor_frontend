<template>
  <div v-if="item">
    <h1>{{item.title}}</h1>
    <p>{{item.description}}</p>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useItemStore} from "../store/index.js";
import {useRoute} from "vue-router";

const itemStore = useItemStore()
const getItemById = itemStore.getItemById

const item = ref(undefined)
const route = useRoute()

onMounted(() => {
  itemStore.fetchItems()
  item.value = getItemById(route.params.id)
  console.log(item.value)
})
</script>

<style scoped>

</style>