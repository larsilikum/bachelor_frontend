<template>
  <svg style="position: absolute; width: 128px; height: 128px; visibility: hidden;">
    <defs>
      <filter id="discrete" x="0" y="0" width="128px" height="128px">
        <feGaussianBlur in="SourceGraphic" result="blurred" :stdDeviation="blur">
          <animate ref="blurIn" id="blur-anim-in" attributeName="stdDeviation" attributeType="XML" begin="indefinite" dur="0.5"
                   end="indefinite" :from="blur" to="0" fill="freeze"/>
          <animate ref="blurOut" id="blur-anim-out" attributeName="stdDeviation" attributeType="XML" begin="indefinite" dur="0.5"
                   end="indefinite" from="0" :to="blur" fill="freeze"/>
        </feGaussianBlur>
        <feComponentTransfer in="blurred" result="seperated">
          <feFuncR type="discrete" :tableValues="tableValues"></feFuncR>
          <feFuncG type="discrete" :tableValues="tableValues"></feFuncG>
          <feFuncB type="discrete" :tableValues="tableValues"></feFuncB>
        </feComponentTransfer>
        <feColorMatrix type="saturate" in="seperated" result="desat" values="1"/>
        <feComponentTransfer in="desat" result="col">
          <feFuncR type="table" tableValues="0 0.1 0.5 0.9 1"/>
          <feFuncG type="table" tableValues="0 0.1 0.5 0.9 1"/>
          <feFuncB type="table" tableValues="0 0.1 0.5 0.9 1"/>
<!--          0 0.1 0.5 0.9 1-->
        </feComponentTransfer>
      </filter>
      <filter id="default" x="0" y="0" width="100%" height="100%">
        <feGaussianBlur in="SourceGraphic" result="blurred" stdDeviation="0"/>
      </filter>
    </defs>
  </svg>
  <img src="../assets/example.png">
  <img src="../assets/test.png">
  <img src="../assets/trump.jpg">
</template>

<script setup>
import {watch, ref} from "vue"

const tableValues = ref('')
const blur = ref(7)
const blurIn = ref(null)
const blurOut = ref(null)
function calcTableValues(steps, exclude, repeat) {
  const stepSize = 1 / steps
  let string = ''
  for (let i = 0; i <= steps; i++) {
    if (i > exclude - 1 && i < steps + 1 - exclude) {
      for (let j = 0; j < repeat; j++) {
        string += `${i * stepSize} `
      }
    } else {
      string += `${i * stepSize} `
    }
  }
  return string
}

tableValues.value = calcTableValues(10 , 3, 3)

function restoreImage() {
  blurIn.value.beginElement()
}
function destroyImage() {
  blurOut.value.beginElement()
}
</script>

<style scoped>
img {
  max-height: 700px;
  max-width: 1200px;
  filter: url(#discrete);
  transition: filter 0.5s ease-out;
}

img:hover {
  animation-name: undo-filter;
  animation-delay: 0.45s;
  animation-fill-mode: forwards;
}
@keyframes undo-filter {
  from {
    filter: url(#discrete);
  }
  to {
    filter: none;
  }
}
</style>