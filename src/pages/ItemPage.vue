<template>
  <article>
    <div class="info" v-if="item">
      <!--      <h1 class="big-type">{{item.title}}</h1>-->
      <p class="trigger">
        CONTAINS: <br>
        <span v-for="trigger in item.trigger">{{ trigger.trigger_id.title }} <br></span>
      </p>
      <p class="meta">
        <span v-show="item.uploaded">POSTED: {{ item.uploaded }}<br></span>
        SOURCE: <a v-if="item.source" :href="item.source.url" target="_blank">{{ item.source.title }}</a><br>
        UPLOADED: {{ new Date(item.date_created).toLocaleDateString('en-GB', dateOptions) }} <br>
      </p>
      <p class="description" v-html="item.description">
      </p>
      <div class="references" v-if="item.references.length">
        <p class="big-type">Referenced Items</p>
        <item-preview v-for="reference in item.references" :item="reference.related_item_id" index="1"/>
      </div>
      <div class="references" v-if="referring.length">
        <p class="big-type">Items Referring</p>
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

.display {

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

.trigger, .trigger span {
  text-transform: uppercase;
  color: var(--hi-col);
}

.meta {
  text-transform: uppercase;
  text-align: justify;
  text-align-last: justify;
}

.description {
  text-align: justify;
  margin-bottom: 80px;
}

:deep(strong) {
  font-weight: normal;
  -webkit-text-stroke-width: 10px;
}

:deep(strong:hover) {
  animation: stroke-width 300ms linear;
  animation-fill-mode: forwards;
  -webkit-text-stroke-width: 0;
}

:deep(a), a {
  color: var(--pri);
}

@keyframes stroke-width {
  0% {
    -webkit-text-stroke-width: 10px;
  }
  8.3% {
    -webkit-text-stroke-width: 8.5px;
  }
  16.6% {
    -webkit-text-stroke-width: 7.2px;
  }
  25% {
    -webkit-text-stroke-width: 6.1px;
  }
  33.3% {
    -webkit-text-stroke-width: 5.2px;
  }
  41.6% {
    -webkit-text-stroke-width: 4.3px;
  }
  50% {
    -webkit-text-stroke-width: 3.5px;
  }
  58.3% {
    -webkit-text-stroke-width: 2.7px;
  }
  66.6% {
    -webkit-text-stroke-width: 1.9px;
  }
  75% {
    -webkit-text-stroke-width: 1.1px;
  }
  83.3% {
    -webkit-text-stroke-width: 0.3px;
  }
  100% {
    -webkit-text-stroke-width: 0px;
  }
}

</style>