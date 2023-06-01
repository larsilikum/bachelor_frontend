<template>
  <div ref="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'
import { useRouter } from 'vue-router'
import {useItemStore} from '../../store/index.js'

const store = useItemStore()
const router = useRouter()
const map = ref(null);
const elements = ref([])
const dimensions = ref({
  width: 1000,
  height: 600
})


onMounted(async() => {
  elements.value = await store.getItems
  const svg = d3.select(map.value).append("svg")
      .attr("width", dimensions.value.width)
      .attr("height", dimensions.value.height)
  console.log(elements.value)

  // Create a map to hold counts of references for each element
  const referenceCounts = new Map();

  elements.value.forEach(element => {
    element.references.forEach(reference => {
      const referencedId = reference.related_item_id.id;
      if (referenceCounts.has(referencedId)) {
        referenceCounts.set(referencedId, referenceCounts.get(referencedId) + 1);
      } else {
        referenceCounts.set(referencedId, 1);
      }
    });
  });

  // line Dataset
  let linesData = [];
  elements.value.forEach(element => {
    // Add logic if element is hovered
    element.isHovered = false

    // Add a referenceCount property to each element
    element.referenceCount = referenceCounts.get(element.id) || 0;

    // Add the radius size
    element.radiusSize = Math.sqrt(element.referenceCount * 5000 + 400)

    element.references.forEach(reference => {
      let relatedElement = elements.value.find(e => e.id === reference.related_item_id.id);
      if (relatedElement) {
        linesData.push({ source: element, target: relatedElement });
      }
    });
  });

  elements.value.sort((a , b) => b.radiusSize - a.radiusSize)


  // Draw circles...
  const circles = svg.selectAll("circle")
      .data(elements.value)  // bind elements to circles
      .enter().append("circle")  // create new circle for each element
      .attr("r", d => d.radiusSize)  // radius depends on number of references
      .attr("cx", d => {
        d.x = Math.random() * dimensions.value.width
        return d.x
      })  // random x position
      .attr("cy", d => {
        d.y = Math.random() * dimensions.value.height
        return d.y
      }) // random y position
      .style("fill", d => `rgb(${d.referenceCount * 40},${d.referenceCount * 40},${d.referenceCount * 40})`)

  // Draw lines...
  const lines = svg.selectAll("line")
      .data(linesData)
      .enter().append("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .style("stroke", "black")
      .style("opacity", 0)

  // Draw text
  const texts = svg.selectAll("text")
      .data(elements.value)
      .enter().append("text")
      .attr("x", d => d.x + d.radiusSize + 8)  // position text 8px to the right of the circle
      .attr("y", d => d.y + 7)  // align the vertical position of the text with the circle
      .text(d => d.title)  // set the text content to the element's title
      .style("font-size", "20px")  // set the font size
      .style("opacity", 0);  // hide the text initially


  // Handle interactions...
  circles
      .on("mouseenter", (event, data) => {
        // Handle mouse enter...
        data.isHovered = true
        lines.style("opacity", d => d.source.isHovered || d.target.isHovered ? 1 : 0)
        texts.style("opacity", d => d.isHovered ? 1 : 0)
      })
      .on("mouseleave", (event, data) => {
        // Handle mouse leave...
        data.isHovered = false
        lines.style("opacity", d => d.source.isHovered || d.target.isHovered ? 1 : 0)
        texts.style("opacity", d => d.isHovered ? 1 : 0);
      })
      .on("click", (event, data) => {
        router.push('/item/' + data.id)

      });
});
</script>
