<template>
  <main>
    <pixel-image/>
  </main>
</template>

<script setup>
import { WBK } from 'wikibase-sdk'
import {onMounted} from "vue";
import TestImage from "./components/testImage.vue";
import CanvasImage from "./components/canvasImage.vue";
import PixelImage from "./components/pixelImage.vue";
const wbk = WBK({
  instance: 'https://localhost',
  sparqlEndpoint: 'http://localhost:8834/proxy/wdqs/bigdata/namespace/wdq/sparql' // Required to use `sparqlQuery` and `getReverseClaims` functions, optional otherwise
})
  const sparql = 'SELECT ?s ?p ?o ?sLabel ?oLabel ?pLabel ' +
      'WHERE { ' +
      '?s ?p ?o . ' +
      '} LIMIT 100'
const url = wbk.sparqlQuery(sparql)
const headers = { 'User-Agent': '<client name>/<version> (<contact information>) <library/framework name>/<version>' }; // see https://meta.wikimedia.org/wiki/User-Agent_policy
// request the generated URL with your favorite HTTP request library
onMounted(async () => {
  const response = await fetch(url)
  console.log(await response.json())
})
</script>

<style scoped>
main {
  background-color: #E8CFCF;
}
</style>
