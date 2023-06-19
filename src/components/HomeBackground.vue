<template>
  <div :id="`canvas-container-${minSize}`" class="canvas-container" ref="container"></div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue"
import P5 from 'p5'

const container = ref(null)
const props = defineProps(['maxSize', 'minSize'])
let sketch

onMounted(() => {
  const script = function (p5) {
    let spacing = 15
    let c = p5.color('#FE4936')
    let xMax, yMax, size
    let timeNow, oldTime
    p5.setup = _ => {

      const canvas = p5.createCanvas(container.value.clientWidth, container.value.clientHeight)
      canvas.parent(`canvas-container-${props.minSize}`)
      p5.frameRate(30)
      p5.noiseSeed(598)
      xMax = Math.ceil(p5.width / spacing)
      yMax = Math.ceil(p5.height / spacing)
      size = (p5.width + p5.height) / 22
      timeNow = Date.now()
    }

    p5.draw = _ => {
      p5.clear()
      p5.fill(c)
      p5.noStroke()

      const multiply = ((p5.mouseY / p5.height) * 70) + 50
      const mouX = p5.mouseX/1000
      for (let x = 0; x < xMax; x++) {
        for (let y = 0; y < yMax; y++) {
          const diff = (p5.noise(x / 57, y / 57, mouX) - (0.31)) * multiply
          const div = diff / 5
          const radius = p5.constrain(size / (1 + diff) - size / (14 + div), 0, size)

          if(radius > props.minSize && radius <= props.maxSize) p5.circle(x * spacing, y * spacing, radius)
        }
      }
      oldTime = timeNow
      p5.noLoop();
    }

    p5.mouseMoved = _ => {
      p5.loop()
      return false
    }

    p5.windowResized = _ => {
      p5.resizeCanvas(container.value.clientWidth, container.value.clientHeight)
      xMax = Math.ceil(p5.width / spacing)
      yMax = Math.ceil(p5.height / spacing)
      size = (p5.width + p5.height) / 22
      p5.loop()
    }
  }
  sketch = new P5(script)
})
onBeforeUnmount(() => {
  sketch.remove() // this will remove the canvas and stop the sketch
})
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
</style>
