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
    let isHovering = false
    let duration = 0
    let pixelVals = []
    let pixelColors = []
    let spacing = 7
    let buffer = []
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
      p5.frameRate(30)
      p5.rectMode(p5.CENTER)

      p5.calcImageValues()

      buffer.push(p5.generateBuffer(0))
      p5.clear()
    }

    p5.draw = _ => {
      if (duration < 8) {
        p5.clear()
        p5.tint(255, p5.lerp(0, 255, duration / 7))
        p5.image(img, 0, 0, p5.width, p5.height)
        p5.tint(255,255)
      }
      if(duration < 7) {
        p5.tint(255, p5.lerp(255, 128, duration / 7))
        p5.image(buffer[duration], 0, 0, p5.width, p5.height)
      }
      if(buffer.length < 7 && p5.frameCount > 1 && p5.frameCount < 8) {
          buffer.push(p5.generateBuffer(buffer.length))
      }
      if(p5.frameCount > 8) {
        if (!isHovering && duration === 0) p5.noLoop()
        else if(!isHovering) duration--
        else if (duration < 8) duration++
      }
    }

    p5.mouseMoved = _ => {
      if (p5.mouseX >= 0 && p5.mouseX < p5.width && p5.mouseY >= 0 && p5.mouseY < p5.height) {
        isHovering = true
        p5.loop()
      } else if (isHovering) {
        isHovering = false
      }
      return false
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
      if (img.width / img.height > c.width / c.height) {
        i.width = c.width
        i.height = img.height * i.width / img.width
      } else {
        i.height = c.height
        i.width = img.width * i.height / img.height
      }
    }

    p5.calcImageValues = () => {
      const ratio = i.width / i.height
      let width,height
      if(ratio > 1) {
        width = 1440
        height = width / ratio
      } else {
        height = 1000
        width = height * ratio
      }
      const b = p5.createGraphics(width, height)
      b.clear()
      b.image(img, 0, 0, b.width, b.height)

      b.loadPixels()
      let d = b.pixelDensity()
      const xMax = Math.floor(b.width / spacing)
      const yMax = Math.floor(b.height / spacing)
      for (let x = 0; x < xMax; x++) {
        pixelColors.push([])
        for (let y = 0; y < yMax; y++) {
          const index = 4 * ((y * d * spacing) * Math.floor(b.width) * d + (x * d * spacing))
          const color = b.color(b.pixels[index],b.pixels[index + 1],b.pixels[index + 2],b.pixels[index + 3])
          pixelColors[x].push(color)
        }
      }
      b.background(255)
      b.image(img, 0, 0, b.width, b.height)
      b.filter(b.GRAY)
      b.loadPixels()
      let lightCount = 0, darkCount = 0
      const amnt = b.width * b.height * 4 * d
      const step = 4 * d * 20

      darkAvg = 0
      lightAvg = 0
      for (let i = 0; i < amnt; i += step) {
        let pix = b.pixels[i]
        if (pix <= 127) {
          darkAvg += pix / 128
          darkCount++
        } else if (pix > 127) {
          lightAvg += pix / 128
          lightCount++
        }
      }
      darkAvg = darkAvg / darkCount
      lightAvg = lightAvg / lightCount

      isSymbol = darkAvg < 0.2 || lightAvg > 1.8

      //calculate pixelValues
      pixelVals = []
      for (let x = 0; x < xMax; x++) {
        pixelVals.push([])
        for (let y = 0; y < yMax; y++) {
          const index = 4 * ((y * d * spacing) * Math.floor(b.width) * d + (x * d * spacing))
          pixelVals[x].push(b.pixels[index])
        }
      }
    }

    p5.generateBuffer = (it) => {
      const ratio = i.width / i.height
      let width,height
      if(ratio > 1) {
        width = 1440
        height = width / ratio
      } else {
        height = 1000
        width = height * ratio
      }
      let b = p5.createGraphics(width, height)

      b.clear()
      b.fill(0)
      b.noStroke()

      const xMax = Math.floor(b.width / spacing)
      const yMax = Math.floor(b.height / spacing)
      const size = (b.width + b.height) / 15
      for (let x = 0; x < xMax; x++) {
        for (let y = 0; y < yMax; y++) {
          const diff = isSymbol ? (b.noise(x / 25, y / 25) - (0.31 + pixelVals[x][y] / 5000)) * 70 : 0
          const div = isSymbol ? diff / 5 : 0
          const radius = b.lerp(b.constrain(size / (Math.sqrt(pixelVals[x][y] + 1) + diff) - size / (14 + div), 0, size), spacing, it / 6)

          if(it > 0) b.fill(b.lerpColor(b.color(0),pixelColors[x][y], it/6))
          b.circle(x * spacing, y * spacing, radius)
        }
      }
      return b
    }
  }
  new P5(script)
})
</script>

<style scoped>
#canvas-container {
  width: 100%;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 2px solid black;

}
</style>