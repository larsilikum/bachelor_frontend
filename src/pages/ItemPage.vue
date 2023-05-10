<template>
  <article>
    <div class="info" v-if="item">
      <h1 class="big-type">{{item.title}}</h1>
      <p class="trigger">
        CONTAINS: <br>
        <span v-for="trigger in item.trigger">{{trigger.trigger_id.title}} <br></span>
      </p>
      <p class="meta">
        <span v-show="item.uploaded">POSTED: {{item.uploaded}}<br></span>
        SOURCE: TWITTER <br>
        UPLOADED: {{new Date(item.date_created).toLocaleDateString('en-GB', dateOptions)}} <br>
      </p>
      <p class="description" v-html="item.description">
      </p>
    </div>
    <image-filter class="image" image-path="src/assets/othala.png"/>
  </article>
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

const dateOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
}

onMounted(async() => {
  item.value = await getItemById(route.params.id)
})
</script>

<style scoped>
/** container **/
article {
  display: grid;
  grid-template-columns: repeat(16, minmax(0, 1fr));
  padding: 10px 10px 0 10px;
}
.info {
  grid-column: 1 / span 3;
}
.image {
  grid-column: 5 / span 12;
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
.meta {
  text-transform: uppercase;
  text-align: justify;
  text-align-last: justify;
}
.description {
  text-align: justify;
}
strong {
  font-weight: normal;
  -webkit-text-stroke-width: 10px;
  transition: 300ms ease-out;
}
strong:hover {
  animation: stroke-width 300ms linear;
  animation-fill-mode: forwards;
  -webkit-text-stroke-width: 0;
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