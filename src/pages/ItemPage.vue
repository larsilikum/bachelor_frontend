<template>
  <article>
    <div class="info">
      <h1 class="big-type">Collage</h1>
      <p class="trigger">
        CONTAINS <br>
        glorification of war <br>
        Lorem ipsum <br>
        Dolor adiscipit amet
      </p>
      <p class="meta">
        POSTED: <span>05 06 2019</span><br>
        SOURCE: TWITTER <br>
        UPLOADED: 12 07 2023 <br>
        FILE: .JPG <br>
        FILESIZE: 12KB
      </p>
      <p class="description">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
        dolore magna aliquyam erat, sed diam <strong>voluptua</strong>. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
        <strong>consetetur sadipscing elitr</strong>, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet.
      </p>
    </div>
    <image-filter class="image" image-path="src/assets/trump.jpg"/>
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

onMounted(() => {
  // itemStore.fetchItemById(route.params.id)
  // item.value = getItemById(route.params.id)
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