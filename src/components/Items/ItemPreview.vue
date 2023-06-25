<template>
  <router-link :to="`/item/${item.id}`">
    <div class="preview-image">
      <image-filter :display="item.display" spacing="22" :index="index"
                    :cat="item.category.parentCategory ? item.category.parentCategory.title : item.category.title"/>
    </div>
    <div class="uppercase cat"><span class="label">Category: </span><span class="value">{{item.category.title}}</span></div>
    <p v-show="show" class="description" v-html="item.description"></p>
    <button @click.prevent="showDescription">{{ show ? 'hide' : 'show' }} description</button>
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
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
}

button:hover {
  font-style: italic;
}

.description {
  text-align: justify;
  margin-bottom: 0;
  clear: both;
}
.cat {
  margin: 1em 0;
  display: flex;
  justify-content: space-between;
  line-height: 1;
  width: 100%;
}

.label {
}

.value {
}

</style>