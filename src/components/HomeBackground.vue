<template>
  <div id="canvas-container" ref="container"></div>
</template>

<script setup>
import {onMounted, ref} from "vue"
import P5 from 'p5'

const container = ref(null)

onMounted(() => {
  const script = function (p5) {
    let spacing = 20
    let c = p5.color('#331917')
    p5.setup = _ => {

      const canvas = p5.createCanvas(container.value.clientWidth, container.value.clientHeight)
      canvas.parent("canvas-container")
      p5.frameRate(30)
      p5.rectMode(p5.CENTER)
      p5.noiseSeed(598)
    }

    p5.draw = _ => {
      p5.clear()
      p5.fill(c)
      p5.noStroke()

      const xMax = Math.floor(p5.width / spacing)
      const yMax = Math.floor(p5.height / spacing)
      const size = (p5.width + p5.height) / 20
      const multiply = p5.map(p5.mouseY, 0 , p5.height, 50, 120)
      for (let x = 0; x < xMax; x++) {
        for (let y = 0; y < yMax; y++) {
          const diff = (p5.noise(x / 20, y / 20, p5.mouseX/1000) - (0.31)) * multiply
          //console.log(70 - p5.mouseX/50 - p5.mouseY/50)
          const div = diff / 5
          const radius = p5.constrain(size / (1 + diff) - size / (14 + div), 0, size)

          p5.circle(x * spacing, y * spacing, radius)
        }
      }
      p5.noLoop();
    }

    p5.mouseMoved = _ => {
      p5.loop()
      return false
    }

    p5.windowResized = _ => {
      p5.resizeCanvas(container.value.clientWidth, container.value.clientHeight)
      p5.loop()
    }
  }
  new P5(script)
})
</script>

<style scoped>
#canvas-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

}
</style>
