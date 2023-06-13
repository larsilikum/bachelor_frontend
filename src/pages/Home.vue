<template>
  <HomeBackground class="background in-front" min-size="50" max-size="1000"/>
  <HomeBackground class="background " min-size="1" max-size="50"/>
  <section id="page">
    <h1>Communi<br>
      cating <br>
      Hate</h1>
    <h2>Decoding rightwing hatesymbols</h2>
    <p>Internet radicalization, epitomized by events like Gamergate or the QAnon conspiracy, has proven a powerful tool
      for
      extremists. It's resulted in real-world harm, with links between online hate and increased hate crime. This has
      been fueled by filter bubbles and ambiguous content that masks extremist propaganda. The <i class="uppercase">Communicating Hate</i>
      archive seeks to expose these concealed messages, curbing their potential harm.</p>


    <p>Various far-right hate symbols and examples of their use can be found on this website. Be aware that you will
      come across a lot of discriminatory content. You can have a look at the map to see connections between symbols and
      which ones are the most popular. Each entry also has its own detail page, which provides context and further
      information about the symbol displayed.</p>
    <h2>Using this Site</h2>
  </section>
</template>

<script setup>

import HomeBackground from "../components/HomeBackground.vue";
import {useColorStore} from "../store/bg.js";

const colorStore = useColorStore()

colorStore.setBgColor('defaultCol')
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
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-column-gap: 20px;
}

* {
  color: var(--pri);
  font-weight: 300;
}

h1, h2 {
  grid-column: span 6;
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
  margin:0 0 3em 0;
}
h2:nth-of-type(odd),p:nth-of-type(even) {
  grid-column: 1 / span 3;
}

h2:nth-of-type(even), p:nth-of-type(odd) {
  grid-column: 4 / span 3;
}
h2:nth-of-type(even) {
  text-align: right;
}


p {
  font-size: 32px;
  margin: 0;
}

.in-front {
  z-index: 2;
}
</style>
