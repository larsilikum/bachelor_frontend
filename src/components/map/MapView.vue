<template>
  <div id="map" ref="map"></div>
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
  width: 1920,
  height: 900
})


onMounted(async() => {
  elements.value = createFakeData()

  const categoryCounts = {
    text: 0,
    image: 0,
    person: 0,
    symbol: 0
  }
  elements.value.forEach((element) => {
    let category = element.category.parentCategory
        ? element.category.parentCategory.title
        : element.category.title;
    categoryCounts[category]++
    if(category === 'text') element.color = '#344759'
    else if(category === 'person') element.color = '#6B561E'
    else if(category === 'image') element.color = '#535810'
    else if(category === 'symbol') element.color = '#6F3821'
  })


  // Determine grid size based on the category with the most elements
  const gridSize = Math.ceil(Math.sqrt(Math.max(...Object.values(categoryCounts)) * 10 ));
  console.log(gridSize)

  // Create the grid
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));


  const minRadius = 10

  const svg = d3.select(map.value).append("svg")
      .attr("width", dimensions.value.width)
      .attr("height", dimensions.value.height)

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
    element.radiusSize = element.referenceCount * 15 + minRadius

    element.references.forEach(reference => {
      let relatedElement = elements.value.find(e => e.id === reference.related_item_id.id);
      if (relatedElement) {
        linesData.push({ source: element, target: relatedElement });
      }
    });
  });

  const categoryBasePositions = {
    text: { x: 0, y: 0 },
    symbol: { x: dimensions.value.width, y: 0 },
    person: { x: dimensions.value.width, y: dimensions.value.height },
    image: { x: 0, y: dimensions.value.height },
  };

  //calculate position
  elements.value.forEach((element) => {
    let category = element.category.parentCategory
        ? element.category.parentCategory.title
        : element.category.title;
    let basePosition = categoryBasePositions[category];

    // Calculate weighted position
    let xSum = 0,
        ySum = 0,
        count = 0;
    element.references.forEach((reference) => {
      const relatedElement = elements.value.find(
          (e) => e.id === reference.related_item_id.id
      );
      if (relatedElement) {
        let relatedCategory = relatedElement.category.parentCategory
            ? relatedElement.category.parentCategory.title
            : relatedElement.category.title;
        xSum += categoryBasePositions[relatedCategory].x;
        ySum += categoryBasePositions[relatedCategory].y;
        count++;
      }
    });
    let avgPosition = {
      x: count > 0 ? (basePosition.x + xSum / count) / 2 : basePosition.x,
      y: count > 0 ? (basePosition.y + ySum / count) / 2 : basePosition.y,
    };

    // Map weighted position to grid cell
    let cellPosition = {
      x: Math.floor((avgPosition.x / dimensions.value.width) * gridSize),
      y: Math.floor((avgPosition.y / dimensions.value.height) * gridSize),
    };
    console.log(count, element.id, avgPosition, cellPosition)
    // Get closest available cell
    let availableCell = getClosestAvailableCell(grid, cellPosition.x, cellPosition.y);

    // Assign element to grid cell
    grid[availableCell.x][availableCell.y] = element;

    // Update element's position to the center of the grid cell
    element.x = (availableCell.x + 0.5) * (dimensions.value.width / gridSize);
    element.y = (availableCell.y + 0.5) * (dimensions.value.height / gridSize);
  });




  elements.value.sort((a , b) => b.radiusSize - a.radiusSize)


  // Draw circles...
  const circles = svg.selectAll("circle")
      .data(elements.value)  // bind elements to circles
      .enter().append("circle")  // create new circle for each element
      .attr("r", d => d.radiusSize)  // radius depends on number of references
      .attr("cx", d => d.x)  // random x position
      .attr("cy", d => d.y) // random y position
      .style("stroke", "#331917")
      .style("stroke-width", 1)
      .style("fill", "#331917")
      .style("opacity", 0.8)

  // Draw lines...
  const lines = svg.selectAll("line")
      .data(linesData)
      .enter().append("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .style("stroke", "#331917")
      .style("stroke-width", 2)
      .style("pointer-events", "none")
      .style("opacity", 0)

  // Draw text
  const texts = svg.selectAll("text")
      .data(elements.value)
      .enter().append("text")
      .attr("x", d => d.x + d.radiusSize + 8)  // position text 8px to the right of the circle
      .attr("y", d => d.y + 7)  // align the vertical position of the text with the circle
      .text(d => d.title)  // set the text content to the element's title
      .style("font-size", "20px")  // set the font size
      .style("pointer-events", "none")
      .style("opacity", 0);  // hide the text initially


  // Handle interactions...
  circles
      .on("mouseenter", (event, data) => {
        // Handle mouse enter...
        data.isHovered = true
        lines.style("opacity", d => d.source.isHovered || d.target.isHovered ? 0.8 : 0)
        texts.style("opacity", d => d.isHovered ? 1 : 0)
      })
      .on("mouseleave", (event, data) => {
        // Handle mouse leave...
        data.isHovered = false
        lines.style("opacity", d => d.source.isHovered || d.target.isHovered ? 0.8 : 0)
        texts.style("opacity", d => d.isHovered ? 1 : 0);
      })
      .on("click", (event, data) => {
        router.push('/item/' + data.id)

      });
});

function getClosestAvailableCell(grid, startX, startY) {
  let x = startX;
  let y = startY;
  let distance = 0;
  let add = (dx, dy) => {
    if (
        x + dx >= 0 &&
        x + dx < grid.length &&
        y + dy >= 0 &&
        y + dy < grid[0].length &&
        !grid[x + dx][y + dy]
    ) {
      x += dx;
      y += dy;
      return true;
    }
    return false;
  };
  if(add(0,0)) return { x, y }
  while (distance < grid.length) {
    distance++;
    const length = distance*2 - 1
    for (let i = 0; i <= length; i++) if (add(-distance + i, distance)) return { x, y };
    for (let i = 0; i <= length; i++) if (add(distance, distance - i)) return { x, y };
    for (let i = 0; i <= length; i++) if (add(-distance, -distance + i)) return { x, y };
    for (let i = 0; i <= length; i++) if (add(distance - i, -distance)) return { x, y };
  }
}

function createFakeData(numElements = 150) {
  const categories = ['text', 'symbol', 'image', 'person'];

  // Helper function to generate random number
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate elements
  const elements = Array.from({ length: numElements }, (_, i) => {
    const category = categories[getRandomInt(0, categories.length - 1)];
    return {
      id: i,
      title: `Element ${i}`,
      category: { title: category, parentCategory: null },
      references: [],
    };
  });

  // Add references
  elements.forEach((element, i) => {
    // Define how many references this element will have (0-10, but mostly less than 5)
    const numReferences = Math.round(Math.sqrt(getRandomInt(0, 10)));

    // Generate references
    for (let j = 0; j < numReferences; j++) {
      // Choose a random element to reference (cannot be self)
      let referenceId;
      do {
        referenceId = getRandomInt(0, numElements - 1);
      } while (referenceId === i);

      // Add reference
      element.references.push({
        related_item_id: {
          id: referenceId,
          category: elements[referenceId].category,
        },
      });
    }
  });

  return elements;
}


</script>
<style>
#map {
  background-color: #DEDEDE;
}
</style>