<template>
  <router-link :to="`/item/${item.id}`">
    <div class="preview-image">
      <image-filter :display="item.display" spacing="35" :index="index"/>
    </div>
    <p v-show="show" class="description" v-html="item.description"></p>
    <button @click.prevent="showDescription">{{show ? 'hide' : 'show'}} description</button>
  </router-link>
</template>

<script setup>
import ImageFilter from "./ImageFilter.vue";
import {ref} from "vue";

defineProps(['item', 'index'])
const show = ref(false)

const showDescription = () => {
  show.value = !show.value
}
</script>

<style scoped>
.preview-image {
  width: 100%;
  aspect-ratio: 4/3;
}

a {
  text-decoration: none;
  margin-bottom: 40px;
  display: block;
}

button {
  background-color: transparent;
  text-decoration: underline;
  font-family: Lunchtype, sans-serif;
  font-size: 1rem;
  border: none;
  margin-top: 1rem;
  text-transform: uppercase;
  cursor: pointer;
}

button:hover{
  font-style: italic;
}

.description {
  text-align: justify;
  margin-bottom: 0;
}

</style>