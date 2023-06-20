<template>
  <HomeBackground class="background in-front" min-size="50" max-size="1000"/>
  <HomeBackground class="background " min-size="1" max-size="50"/>
  <section id="page">
    <h1>Communi<br>
      cating <br>
      Hate</h1>

    <div class="text-block">
      <h2>Decoding rightwing hatesymbols</h2>
      <p class="description">Internet radicalization, epitomized by events like Gamergate or the QAnon conspiracy, has proven a powerful tool
        for
        extremists. It's resulted in real-world harm, with links between online hate and increased hate crime. This has
        been fueled by filter bubbles and ambiguous content that masks extremist propaganda. The <i class="uppercase">Communicating Hate</i>
        archive seeks to expose these concealed messages, curbing their potential harm.</p>
    </div>

    <div class="text-block">
      <h2>Using this Site</h2>
      <p class="description">Various far-right hate symbols and examples of their use can be found on this website. <em>Be aware that you will
        come across a lot of discriminatory content.</em> You can have a look at the map to see connections between symbols and
        which ones are the most popular. Each entry also has its own detail page, which provides context and further
        information about the symbol displayed.</p>
    </div>
    <div class="category-intro">
      <h2>Contents</h2>
      <p>The items of the collection are seperated into four main categories. These are images, symbols, texts and theories.
      In the following the ten elements which are referenced the most, are shown from each category.</p>
    </div>


    <template v-if="Object.keys(items).length">
      <div class="category-previews" v-for="(its,cat,i) in items">
        <h2>{{cat}}</h2>
        <div class="titles">
          <template  v-for="(item, i) in its"><router-link :to="`/item/${item.id}`" class="title" :style="`--color: ${(colorStore.getColorsOfCategory(cat)).highlight}`" v-if="i < 10"><span class="name">{{item.title}}</span><span>→</span></router-link></template>
        </div>
      </div>
    </template>

  </section>
</template>

<script setup>

import HomeBackground from "../components/HomeBackground.vue";
import ItemPreview from "../components/Items/ItemPreview.vue";
import {useColorStore} from "../store/bg.js";
import {useItemStore} from "../store/index.js";
import {onMounted, ref} from "vue";

const itemStore = useItemStore()
const items = ref({})

const colorStore = useColorStore()

colorStore.setBgColor('defaultCol')

onMounted(async() => {

  const all = await itemStore.getItems
  // Create a map to hold counts of references for each element
  const referenceCounts = new Map();
  all.forEach(element => element.connectedElementIds = element.references.map(ref => ref.related_item_id.id))
  all.forEach(element => {
    element.references.forEach(reference => {
      const referencedId = reference.related_item_id.id
      const relEl = all.find(el => el.id === referencedId)
      if (relEl) relEl.connectedElementIds.push(element.id)
      if (referenceCounts.has(referencedId)) {
        referenceCounts.set(referencedId, referenceCounts.get(referencedId) + 1);
      } else {
        referenceCounts.set(referencedId, 1);
      }
    })
  })
  all.forEach(el =>  el.referenceCount = referenceCounts.get(el.id) || 0)
  all.sort((a,b) => - a.referenceCount + b.referenceCount)
  const categories = ['image', 'text', 'symbol', 'person']
  for(const c in categories) {
    const key = categories[c]
    items.value[key] = all.filter(el => getCat(el) === key)
  }
})
function getCat(item) {
  return item.category.parentCategory ? item.category.parentCategory.title : item.category.title
}
</script>

<style scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
}

#page {
  position: relative;
  z-index: 1;
  padding: 0 10px;
}

.text-block {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-column-gap: 40px;
  margin-bottom: 160px;
}

* {
  color: var(--pri);
  font-weight: 300;
}

h1, h2 {
  text-transform: uppercase;
  line-height: 1;
}

h1 {
  font-size: 16vw;
  text-align: right;
  margin-top: -20px;
}

h2 {
  font-size: 6vw;
  margin: 0;
}
em {
  color: #FE4936;
}
.text-block:nth-of-type(odd) h2,.text-block:nth-of-type(even) p {
  grid-column: 1 / span 3;
  grid-row: 1;
}

.text-block:nth-of-type(even) h2,.text-block:nth-of-type(odd) p {
  grid-column: 4 / span 3;
  grid-row: 1;
}
.text-block:nth-of-type(even) h2 {
  text-align: right;
}
.category-intro {
  margin: 0 25% 160px 25%;
  width: 50%;
}

.category-intro h2 {
  margin-bottom: 0.3em
}

.category-previews {
  position: relative;
  grid-column: 1 / span 6;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-column-gap: 20px;
  margin-bottom: 160px;
}
.category-previews h2 {
  margin-bottom: 0;
  grid-column: 1 / 2;
  text-align: center;
}
.titles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-column-gap: 20px;
}
.title span {
  font-size: 30px;
}
.title .name {
  -webkit-text-stroke-width: 0.56em;
}
.title {
  display: flex;
  justify-content: space-between;
  border-top: 2px solid var(--color);
  padding: 0.5em;
  margin: 0;
  cursor: pointer;
}
.title .name:hover {
  animation: stroke-width 300ms linear;
  animation-fill-mode: forwards;
  -webkit-text-stroke-width: 0;
}


p {
  font-size: 30px;
  margin: 0;
}
.description {
  margin-top: 0.2em;
}

.in-front {
  z-index: 2;
}
a {
  text-decoration: none;
}
</style>
