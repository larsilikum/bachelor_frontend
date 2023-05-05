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

      <filter id="noblur" x="0" y="0" width="128px" height="128px">
        <feGaussianBlur in="SourceGraphic" result="blurred" :stdDeviation="1">
          <animate ref="blurIn" id="blur-anim-in" attributeName="stdDeviation" attributeType="XML" begin="indefinite" dur="0.5"
                   end="indefinite" :from="blur" to="0" fill="freeze"/>
          <animate ref="blurOut" id="blur-anim-out" attributeName="stdDeviation" attributeType="XML" begin="indefinite" dur="0.5"
                   end="indefinite" from="0" :to="blur" fill="freeze"/>
        </feGaussianBlur>
        <feComponentTransfer in="blurred" result="seperated">
          <feFuncR type="discrete" tableValues="0.1 1 0.5 1"></feFuncR>
          <feFuncG type="discrete" tableValues="0.2 0.6 0.7"></feFuncG>
          <feFuncB type="discrete" tableValues="1 0.6 1 1"></feFuncB>
        </feComponentTransfer>
        <feColorMatrix type="saturate" in="seperated" result="desat" values="1"/>
        <feComponentTransfer in="desat" result="col">
          <feFuncR type="table" tableValues="0 0.1 0.5 0.9 1"/>
          <feFuncG type="table" tableValues="0 0.1 0.5 0.9 1"/>
          <feFuncB type="table" tableValues="0 0.1 0.5 0.9 1"/>
          <!--          0 0.1 0.5 0.9 1-->
        </feComponentTransfer>
      </filter>

      <filter id="blur" x="0" y="0" width="128px" height="128px">
        <feGaussianBlur in="SourceGraphic" result="blurred" :stdDeviation="blur"/>
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
        <feGaussianBlur in="col" stdDeviation="2"/>
      </filter>
    </defs>
  </svg>
  <canvas ref="canvas" ></canvas>
</template>

<script setup>
import {ref, onMounted} from "vue";
import Dither from "canvas-dither"

const tableValues = ref('')
const blur = ref(3)
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
tableValues.value = calcTableValues(5,1,3)

const canvas = ref(null)
onMounted(() => {
  const ctx = canvas.value.getContext('2d');

  const image = new Image();
  image.onload = () => {
    let factor = 2
    canvas.value.width = image.width
    canvas.value.height = image.height
    ctx.filter = 'url(#discrete)'
    ctx.drawImage(image, 0, 0, image.width/factor, image.height/factor)
    let imageData = ctx.getImageData(0,0, canvas.value.width/factor, canvas.value.height/factor)
    imageData = Dither.floydsteinberg(imageData)
    ctx.putImageData(imageData, 0 , 0)
    const img = new Image()
    img.src = canvas.value.toDataURL()
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.value.width, canvas.value.height)
    ctx.filter = 'url(#noblur)'
    ctx.drawImage(img, 0, 0, img.width*factor, img.height*factor)
    ctx.globalCompositeOperation = 'lighten'
    ctx.filter = 'none'
    ctx.fillStyle = '#DE404C'
    // ctx.fillRect(0,0,canvas.value.width, canvas.value.height)
    // ctx.filter = 'url(#blur)'
    // ctx.drawImage(image, 0, 0)
  }

  image.src = 'src/assets/trump.jpg'
})

</script>

<style scoped>

</style>