<template>
<div id="canvas-container" ref="container"></div>
</template>

<script setup>
import {onMounted, ref} from "vue"
import P5 from 'p5'

const props = defineProps(['imagePath'])
const imagePath = ref('src/assets/test.png')
const container = ref(null)

onMounted(() => {
  const script = function (p5) {
    let img
    let isSymbol = false
    let darkAvg = 0
    let lightAvg = 0
    let i = {
      width: 0,
      height: 0
    }
    p5.preload = _ => {
      img = p5.loadImage(props.imagePath)
    }
    p5.setup = _ => {
      // calculate size
      p5.calcImageSize()
      const canvas = p5.createCanvas(i.width, i.height)
      canvas.parent("canvas-container")

      p5.background(255)
      p5.image(img, 0, 0, i.width, i.height)
      p5.filter(p5.GRAY)
      p5.loadPixels()
      let d = p5.pixelDensity()

      let lightCount = 0, darkCount = 0
      const amnt = p5.width * p5.height * 4 * d
      const step = 4 * d * 20

      darkAvg = 0
      lightAvg = 0
      for (let i = 0; i < amnt; i += step) {
        let pix = p5.pixels[i]
        if(pix <= 127) {
          darkAvg += pix/128
          darkCount ++
        } else if(pix > 127) {
          lightAvg += pix/128
          lightCount ++
        }
      }
      darkAvg = darkAvg / darkCount
      lightAvg = lightAvg / lightCount

      isSymbol = darkAvg < 0.2 || lightAvg > 1.8

      p5.clear()
    }

    p5.draw = _ => {
      let spacing = Math.floor(p5.map(p5.width + p5.height, 0, 4000, 4, 8))

      p5.background(255)
      p5.image(img, 0, 0, i.width, i.height)
      p5.filter(p5.GRAY)
      p5.loadPixels()
      let d = p5.pixelDensity()

      let pixelVals = []
      // const amnt = p5.width*p5.height*d*4
      // const step = 4*spacing
      // for (let i = 0; i < amnt; i+=step) {
      //   const bri = p5.pixels[i]
      //   pixelVals.push(bri)
      // }
      const xMax = Math.floor(p5.width / spacing)
      const yMax = Math.floor(p5.height / spacing)
      for (let x = 0; x < xMax; x ++) {
        pixelVals.push([])
        for (let y = 0; y < yMax; y ++) {
          const index = 4 * (( y * d * spacing ) * Math.floor(p5.width) * d + ( x * d * spacing ))
          pixelVals[x].push(p5.pixels[index])
        }
      }
      p5.clear()
      p5.fill(0)
      p5.noStroke()
      // for (const i in pixelVals) {
      //   const radius = 100 / pixelVals[i] + 1
      //   const x = ( i %  p5.width) * spacing
      //   const y = Math.floor( i * spacing / p5.width)
      //   if(y%spacing === 0) p5.circle(x,y,radius)
      // }
      const size = (p5.width + p5.height) / 15
      for (let x = 0; x < xMax; x ++) {
        for (let y = 0; y < yMax; y ++) {
          const diff = isSymbol ? (p5.noise(x/25,y/25) - (0.31 + pixelVals[x][y]/5000)) * 70 : 0
          const div = isSymbol ? diff / 5 : 0
          const radius = p5.constrain(size / (p5.sqrt(pixelVals[x][y] + 1 ) + diff) - size / ( 14 + div), 0, size)
          p5.circle(x * spacing, y * spacing, radius)
        }
      }

      p5.noLoop()
    }

    p5.windowResized = _ => {
      p5.calcImageSize()
      p5.resizeCanvas(i.width, i.height)
      p5.loop()
    }

    p5.calcImageSize = _ => {
      let c = {
        width: container.value.clientWidth,
        height: container.value.clientHeight
      }
      if(img.width / img.height > c.width / c.height) {
        i.width = c.width
        i.height = img.height * i.width / img.width
      }
      else {
        i.height = c.height
        i.width = img.width * i.height / img.height
      }
    }
  }
  new P5(script)
})
</script>

<style scoped>
#canvas-container {
  width: 70vw;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 2px solid black;

}
</style>