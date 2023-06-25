<template>
  <article>
    <div class="info" v-if="item">
      <!--      <h1 class="big-type">{{item.title}}</h1>-->
      <p class="trigger" v-if="item.trigger">
        CONTAINS: <br>
        <span v-for="trigger in item.trigger" class="trigger-text">{{ trigger.trigger_id.title }} <br></span>
      </p>
      <p class="meta">
        <span v-show="item.uploaded">POSTED: {{ item.uploaded }}<br></span>
        <span v-show="item.source">SOURCE: <a v-if="item.source" :href="item.source.url" target="_blank">{{ item.source.title }}</a><br></span>
        UPLOADED: {{ new Date(item.date_created).toLocaleDateString('en-GB', dateOptions) }} <br>
        <span class="meta-flex"><span>Category: </span><span>{{item.category.title}}</span></span>
      </p>
      <p class="description" v-html="item.description">
      </p>
      <div class="references" v-if="item.references.length">
        <p class="big-type">Linking to</p>
        <item-preview v-for="reference in item.references" :item="reference.related_item_id" index="1"/>
      </div>
      <div class="references" v-if="referring.length">
        <p class="big-type">Linked by</p>
        <item-preview v-for="reference in referring" :item="reference" index="2"/>
      </div>
    </div>
    <div id="image-filter">
      <image-filter class="display" v-if="item" :display="item.display"
                    :cat="item.category.parentCategory ? item.category.parentCategory.title : item.category.title"
                    spacing="8" index="0"/>
    </div>
  </article>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useItemStore} from "../store/index.js";
import {useRoute} from "vue-router";
import ImageFilter from "../components/Items/ImageFilter.vue";
import ItemPreview from "../components/Items/ItemPreview.vue";
import {useColorStore} from "../store/bg.js";

const itemStore = useItemStore()
const getItemById = itemStore.getItemById
const getReferencingItems = itemStore.getReferencingItems

const colorStore = useColorStore()

const item = ref(undefined)
const referring = ref([])
const route = useRoute()

const dateOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
}

onMounted(async () => {
  const id = route.params.id
  item.value = await getItemById(id)
  const cat = item.value.category.parentCategory ? item.value.category.parentCategory.title : item.value.category.title
  colorStore.setBgColor(cat)
  referring.value = await getReferencingItems(id)
})
</script>

<style scoped>
/** container **/
article {
  display: grid;
  grid-template-columns: repeat(16, minmax(0, 1fr));
  padding: 10px;
}

.info {
  grid-column: 1 / span 3;
}

#image-filter {
  width: 100%;
  height: calc(100vh - 76px);
  grid-column: 5 / span 12;
  position: sticky;
  top: 66px;
  right: 0;
}

.references {
  margin-bottom: 80px;
}

/** text styles **/
h1 {
  font-weight: normal;
  font-style: italic;
  margin: 0 0 40px 0;
}

p {
  margin-bottom: 40px;
}

.trigger {
  text-transform: uppercase;
}
.trigger-text {
  color: var(--hi-col);

}

.meta {
  text-transform: uppercase;
  text-align: justify;
  text-align-last: justify;
}

.meta-flex {
  display: flex;
  justify-content: space-between;
}

.description {
  text-align: justify;
  margin-bottom: 80px;
}

:deep(a), a {
  color: var(--pri);
}

:deep(strong) {
  font-weight: normal;
  -webkit-text-stroke-width: 0.56em; /* 10px/18px */
  paint-order: stroke fill;
}

:deep(strong:hover) {
  animation: stroke-width 300ms linear;
  animation-fill-mode: forwards;
  -webkit-text-stroke-width: 0;
}
@media screen and (max-width: 1000px) {
  article {
    display: flex;
    flex-direction: column;
  }
  #image-filter {
    order: 1;
    position: static;
    height: 75vw;
    margin-bottom: 40px;
  }
  .info {
    order: 2;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }
}


</style>