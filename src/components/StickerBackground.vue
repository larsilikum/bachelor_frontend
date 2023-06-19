<template>
  <div :id="`canvas-container-${index}`" class="canvas-container" ref="container"></div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue"
import P5 from 'p5'

const container = ref(null)
const props = defineProps(['index'])
let sketch

onMounted(() => {
  const script = function (p5) {
    let spacing = 30
    let c = p5.color('#331917')
    let xMax, yMax, size
    let mX, mY
    let timeNow, oldTime
    p5.setup = _ => {

      const canvas = p5.createCanvas(container.value.clientWidth, container.value.clientHeight)
      canvas.parent(`canvas-container-${props.index}`)
      p5.frameRate(30)
      p5.noiseSeed(Math.random()*timeNow)
      mX = Math.floor(p5.random(0,1800))
      mY = Math.floor(p5.random(0,100))
      xMax = Math.ceil(p5.width / spacing)
      yMax = Math.ceil(p5.height / spacing)
      size = (p5.width + p5.height) / 4
      timeNow = Date.now()
    }

    p5.draw = _ => {
      p5.clear()
      p5.fill(c)
      p5.noStroke()

      const multiply = ((mY / p5.height) * 70) + 50
      const mouX = mX/1000
      for (let x = 0; x < xMax; x++) {
        for (let y = 0; y < yMax; y++) {
          const diff = (p5.noise(x / 37, y / 37, mouX) - (0.31)) * multiply
          const div = diff / 5
          const radius = p5.constrain(size / (1 + diff) - size / (14 + div), 0, size)

          if(radius > 1 ) p5.circle(x * spacing, y * spacing, radius)
        }
      }
      oldTime = timeNow
      p5.noLoop();
    }

    p5.keyPressed = event => {
      if(event.key === 's') p5.save(`#####-sticker-${timeNow}.png`)
    }

    p5.windowResized = _ => {
      // p5.resizeCanvas(container.value.clientWidth, container.value.clientHeight)
      // xMax = Math.ceil(p5.width / spacing)
      // yMax = Math.ceil(p5.height / spacing)
      // size = (p5.width + p5.height) / 22
      // p5.loop()
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
