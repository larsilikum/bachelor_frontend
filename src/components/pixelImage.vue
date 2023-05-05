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
        <feGaussianBlur in="SourceGraphic" result="blurred" :stdDeviation="3">
          <animate ref="blurIn" id="blur-anim-in" attributeName="stdDeviation" attributeType="XML" begin="indefinite" dur="0.5"
                   end="indefinite" :from="blur" to="0" fill="freeze"/>
          <animate ref="blurOut" id="blur-anim-out" attributeName="stdDeviation" attributeType="XML" begin="indefinite" dur="0.5"
                   end="indefinite" from="0" :to="blur" fill="freeze"/>
        </feGaussianBlur>
      </filter>

      <filter id="blur" x="0" y="0" width="128px" height="128px">
        <feGaussianBlur in="SourceGraphic" result="blurred" :stdDeviation="blur"/>
        <feColorMatrix type="saturate" in="blurred" result="desat" values="0"/>
      </filter>
    </defs>
  </svg>
  <canvas ref="canvas" ></canvas>
</template>

<script setup>
import {ref, onMounted} from "vue";
import Dither from "canvas-dither"

const tableValues = ref('')
const blur = ref(1 )
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
tableValues.value = calcTableValues(10,1,2)

const canvas = ref(null)
onMounted(() => {
  const ctx = canvas.value.getContext('2d');

  const image = new Image();
  image.onload = () => {

    const colors = ['FCF29B', 'BCD5FF', 'F578D8', '384FFF']

    // Define your desired color palette
    canvas.value.width = image.width;
    canvas.value.height = image.height;

    // Define the color palette with ranges and hex values
    const colorRanges = [
      { range: [0, 27], color: 'FF0000' },
      { range: [27, 30], color: '64FB6A' },
      { range: [30, 57], color: '922CE2' },
      { range: [57, 60], color: 'FF0000' },
      { range: [60, 67], color: '64FB6A' },
      { range: [67, 70], color: 'FF0000' },
      { range: [70, 100], color: 'FFFFFF'},
    ];

    // Convert hex values to rgba objects
    const colorPalette = colorRanges.map(({ color }) => hexToRgba(color));

    function hexToRgba(hex) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      let a = 255
      if((r+g+b) / 3 === 255) a = 0
      return { r, g, b, a };
    }

    let grd = ctx.createLinearGradient(0, 0, canvas.value.width, 0);
    grd.addColorStop(0, 'black');
    grd.addColorStop(1, 'white');

    //draw image
    const bigger = image.width > image.height ? image.width : image.height;
    const factor = bigger / 170;
    ctx.filter = 'url(#blur)';
    ctx.drawImage(image, 0, 0, image.width / factor, image.height / factor);
    ctx.filter = 'none';

    // resize image
    let imgData = ctx.getImageData(0, 0, canvas.value.width / factor, canvas.value.height / factor);
    ctx.putImageData(imgData, 0, 0);
    const img = new Image();
    img.src = canvas.value.toDataURL();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.filter = 'url(#noblur)';
    ctx.drawImage(img, 0, 0, img.width * factor, img.height * factor);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
    const pixels = imageData.data;

    // Iterate through each pixel and assign color based on brightness
    for (let i = 0; i < pixels.length; i += 4) {
      // Get the current pixel's RGB values
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Calculate brightness
      const brightness = Math.round((r + g + b) / 3)/2.55;

      // Find the color range that matches the brightness
      const colorRange = colorRanges.find(({ range }) => brightness >= range[0] && brightness <= range[1]);

      // Get the corresponding color from the palette
      const color = colorPalette[colorRanges.indexOf(colorRange)];

      // Assign the color to the pixel
      pixels[i] = color.r;
      pixels[i + 1] = color.g;
      pixels[i + 2] = color.b;
      pixels[i + 3] = color.a;
    }

// Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);

  }

  image.src = 'src/assets/trump.jpg'

})

</script>

<style scoped>
canvas {
  max-width: 1200px;
  max-height: 800px;
}
</style>