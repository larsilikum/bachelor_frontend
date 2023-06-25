<template>
  <div id="map-container">
    <aside id="side">
      <p class="big-type" id="title">{{ elementTitle }}</p>
      <p class="big-type">Connected Items:</p>
      <template v-if="connections.length">
        <span v-for="connection in connections" class="connected-items">{{ connection.related_item_id.title }}<br></span>
      </template>
      <div class="legend">
        <p class="uppercase" id="text">Text</p>
        <p class="uppercase" id="symbol">Symbol</p>
        <p class="uppercase" id="image">Image</p>
        <p class="uppercase" id="theory">Theory</p>
      </div>
    </aside>
    <div id="map" ref="map"></div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import * as d3 from 'd3'
import {useRouter} from 'vue-router'
import {useItemStore} from '../../store/index.js'
import {useColorStore} from "../../store/bg.js";
import concaveman from 'concaveman';


const store = useItemStore()
const colorStore = useColorStore()
const getColorsOfCategory = colorStore.getColorsOfCategory

const router = useRouter()
const map = ref(null);
const elements = ref([])
const elementTitle = ref("No item selected")
const elementColor = ref("#331917")
const connections = ref([])
const dimensions = ref({
  width: 1920,
  height: 900
})
colorStore.setBgColor('defaultCol')

onMounted(async () => {
  const amntCellsFaktor = 2
  const divisorConnections = 5

  elements.value = JSON.parse(JSON.stringify(await store.getItems))
  const categories = await store.getCategories

  dimensions.value.width = map.value.clientWidth
  dimensions.value.height = map.value.clientHeight

  const subCategoryCount = categories.reduce((acc, cat) => {
    if(cat.parentCategory) {
      let key = cat.parentCategory.title;
      acc[key] = (acc[key] || [])
      acc[key].push(cat)

    }
    return acc;

  }, {});

  const categoryCounts = {
    text: 0,
    image: 0,
    theory: 0,
    symbol: 0
  }

  elements.value.forEach((element) => {
    let category = element.category.parentCategory
        ? element.category.parentCategory.title
        : element.category.title;
    categoryCounts[category]++
    element.color = (getColorsOfCategory(category)).highlight

    element.connectedElementIds = element.references.map(ref => ref.related_item_id.id);
  })

  const amntCells = elements.value.length * amntCellsFaktor
  const aspectRatio = dimensions.value.width / dimensions.value.height
  const sizeX = Math.ceil(Math.sqrt(amntCells * aspectRatio))
  const sizeY = Math.ceil(sizeX / aspectRatio)

  // Create the grid
  const grid = Array.from({length: sizeX}, () => Array(sizeY).fill(null));


  const minRadius = Math.max(dimensions.value.width / 170, 8)

  const svg = d3.select(map.value).append("svg")
      .attr("width", dimensions.value.width)
      .attr("height", dimensions.value.height)

  // Create a map to hold counts of references for each element
  const referenceCounts = new Map();

  elements.value.forEach(element => {

    element.references.forEach(reference => {
      const referencedId = reference.related_item_id.id;
      const relEl = elements.value.find(el => el.id === referencedId)
      if (relEl) relEl.connectedElementIds.push(element.id)
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
    element.connectionIsHovered = false

    // Add a referenceCount property to each element
    element.referenceCount = referenceCounts.get(element.id) || 0;

    // Add the radius size
    element.radiusSize = element.referenceCount * (minRadius * 0.66) + minRadius

    element.references.forEach(reference => {
      let relatedElement = elements.value.find(e => e.id === reference.related_item_id.id);
      if (relatedElement) {
        linesData.push({source: element, target: relatedElement});
      }
    });
  });

  const categoryBasePositions = {};
  const catCountsArray = []
  for (const key in categoryCounts) {
    catCountsArray.push({title: key, len: categoryCounts[key]})
  }
  catCountsArray.sort((a,b) => b.len - a.len)
  const amntEls = elements.value.length
  const amntFirstHalf = catCountsArray[0].len + catCountsArray[1].len
  const amntSecHalf = catCountsArray[2].len + catCountsArray[3].len
  const widthFirstHalf = ((amntFirstHalf / amntEls)) * dimensions.value.width
  const height0 = ((catCountsArray[0].len / amntFirstHalf)) * dimensions.value.height
  const height1 = ((catCountsArray[2].len / amntSecHalf)) * dimensions.value.height

  const categoryQuadrants = {
    [catCountsArray[0].title]: {
      top: 0,
      left: 0,
      right: widthFirstHalf,
      bottom: height0
    },
    [catCountsArray[2].title]: {
      top: 0,
      left: widthFirstHalf,
      right: dimensions.value.width,
      bottom: height1
    },
    [catCountsArray[1].title]: {
      top: height0,
      left: 0,
      right: widthFirstHalf,
      bottom: dimensions.value.height
    },
    [catCountsArray[3].title]: {
      top: height1,
      left: widthFirstHalf,
      right: dimensions.value.width,
      bottom: dimensions.value.height
    },
  }

  for (const key in categoryQuadrants) {
    const count = subCategoryCount[key].length
    const amntX = Math.ceil(Math.sqrt(count))
    const amntY = Math.ceil(count / amntX)
    const top = categoryQuadrants[key].top
    const left = categoryQuadrants[key].left
    const bottom = categoryQuadrants[key].bottom
    const right = categoryQuadrants[key].right

    const width = (right - left) / amntX
    const height = (bottom - top) / amntY

    for (let i = 0; i < count; i++) {
      const cat = subCategoryCount[key][i].title

      const xS = i % amntX
      const yS = Math.floor(i / amntX)
      const x = xS * width + width / 2
      const y = yS * height + height / 2
      categoryBasePositions[cat] = {
        x: left + x,
        y: top + y
      }
    }
  }

  //calculate position
  elements.value.forEach((element) => {
    let category = element.category.title;
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
        let relatedCategory = relatedElement.category.title
        console.log(relatedCategory)
        xSum += categoryBasePositions[relatedCategory].x;
        ySum += categoryBasePositions[relatedCategory].y;
        count++;
      }
    });
    let avgPosition = {
      x: count > 0 ? basePosition.x + ((xSum / count) - basePosition.x) / divisorConnections : basePosition.x + (5-element.title.length) *5,
      y: count > 0 ? basePosition.y + ((ySum / count) - basePosition.y) / divisorConnections : basePosition.y + (7-element.title.length) *7,
    };
    // let avgPosition = {
    //   x: basePosition.x,
    //   y: basePosition.y,
    // };

    // Map weighted position to grid cell
    let cellPosition = {
      x: Math.floor((avgPosition.x / dimensions.value.width) * sizeX),
      y: Math.floor((avgPosition.y / dimensions.value.height) * sizeY),
    };
    // Get closest available cell
    let availableCell = getClosestAvailableCell(grid, cellPosition.x, cellPosition.y);

    // Assign element to grid cell
    grid[availableCell.x][availableCell.y] = element;

    // Update element's position to the center of the grid cell
    element.x = (availableCell.x + 0.5) * (dimensions.value.width / sizeX);
    element.y = (availableCell.y + 0.5) * (dimensions.value.height / sizeY);
  });


  elements.value.sort((a, b) => b.radiusSize - a.radiusSize)

  // Convert your object into an array of objects
  let categoriesArray = Object.entries(categoryBasePositions).map(([category, position]) => ({
    category,
    ...position,
  }));


  for (const category in categories) {
    const c = categories[category]
    if(c.parentCategory) {
      let boundaryNodes = [];
      let outerShapePath = d3.path();
      const title = c.title
      const mainCat = c.parentCategory ? c.parentCategory.title : c.title
      const col = (getColorsOfCategory(mainCat)).highlight

// Calculate boundary nodes
      const margin = minRadius + 1.5


      for (const el in elements.value) {
        const e = elements.value[el]
        if(e.category.title === title) {
          const xE = e.x
          const yE = e.y
          const length = e.radiusSize + margin
          const p1 = JSON.parse(JSON.stringify(e))
          const p2 = JSON.parse(JSON.stringify(e))
          const p3 = JSON.parse(JSON.stringify(e))
          const p4 = JSON.parse(JSON.stringify(e))
          p1.outlinePos = {x: xE + length, y: yE + length}
          p2.outlinePos = {x: xE - length, y: yE - length}
          p3.outlinePos = {x: xE - length, y: yE + length}
          p4.outlinePos = {x: xE + length, y: yE - length}
          boundaryNodes.push(p1,p2,p3,p4)

        }

      }

      const avgNodes = boundaryNodes

// Calculate concave hull
      const concaveHullPoints = avgNodes.map(node => [node.outlinePos.x, node.outlinePos.y]);
      const concaveHull = concaveHullPoints.length ? concaveman(concaveHullPoints, 1.5) : [];
      if(concaveHull.length) concaveHull.pop()
// Draw shape
      let firstPoint = true;
      if(concaveHull.length) {
        for (let i = 0; i <= concaveHull.length; i++) {
          const index = i % concaveHull.length;
          let currentPoint = concaveHull[index];
          let nextPoint = concaveHull[(index + 1) % concaveHull.length];
          let prevPoint = concaveHull[index - 1] || concaveHull[concaveHull.length - 1]

          if(firstPoint) {
            firstPoint = false;
            let xTo = currentPoint[0] + (- currentPoint[0] + nextPoint[0]) /2
            let yTo = currentPoint[1] + (- currentPoint[1] + nextPoint[1]) /2
            outerShapePath.moveTo(xTo, yTo);
          } else {
            // Using a fixed radius of 30
            outerShapePath.arcTo(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1], margin);
          }
        }
      }


      outerShapePath.closePath();




      const avgX = avgNodes.reduce(function (p, c, i) {
        return p + (c.x - p) / (i + 1)
      }, 0)
      const avgY = avgNodes.reduce(function (p, c, i) {
        return p + (c.y - p) / (i + 1)
      }, 0)
      svg.append("text")
          .text(title)
          .attr("x", avgX || categoryBasePositions[title].x)
          .attr("y", avgY || categoryBasePositions[title].y)
          .attr("font-family", "Lunchtype, sans-serif")  // Set the font as you need
          .attr("font-size", Object.keys(categoryQuadrants).includes(title) ? "48px" : "20px")
          .attr("text-anchor", "middle")
          .attr("fill", col)
          .attr("pointer-events", "none")

// Add shape to your SVG
      svg.append('path')
          .attr("d", outerShapePath.toString())
          .attr("fill", "none")
          .attr("stroke", col)
          .attr("stroke-width", 2)
    }


    // svg.selectAll("circle2")
    //     .data(concaveHull)  // bind elements to circles
    //     .enter().append("circle")  // create new circle for each element
    //     .attr("r", d => '5px')  // radius depends on number of references
    //     .attr("cx", d => d[0])  // random x position
    //     .attr("cy", d => d[1]) // random y position
    //     .style("fill", "#331917")

  }

  // Create a text label for each category
  svg.selectAll("text")
      .data(categoriesArray)
      .enter()
      .append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text(d => d.category)
      .attr("font-family", "Lunchtype, sans-serif")  // Set the font as you need
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("fill", d => (getColorsOfCategory(d.category)).highlight)
      .attr("pointer-events", "none")

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

  // Draw circles...
  const circles = svg.selectAll("circle")
      .data(elements.value)  // bind elements to circles
      .enter().append("circle")  // create new circle for each element
      .attr("r", d => d.radiusSize)  // radius depends on number of references
      .attr("cx", d => d.x)  // random x position
      .attr("cy", d => d.y) // random y position
      .style("stroke", "#331917")
      .style("stroke-width", 2)
      .style("fill", "transparent")
      .style("cursor", "pointer")


  // Handle interactions...
  circles
      .on("mouseenter", (event, data) => {
        // Handle mouse enter...
        data.isHovered = true
        elementColor.value = data.color
        elementTitle.value = data.title
        connections.value = data.references
        data.connectedElementIds.forEach(id => {
          const connectedElement = elements.value.find(e => e.id === id);
          if (!connections.value.find(e => e.related_item_id.id === connectedElement.id)) connections.value.push({related_item_id: connectedElement})
          if (connectedElement) connectedElement.connectionIsHovered = true;
        });
        circles
            .style("stroke", d => d.isHovered || d.connectionIsHovered ? d.color : "#331917")
            .style("fill", d => d.isHovered || d.connectionIsHovered ? "#331917" : "transparent")
        lines
            .style("opacity", d => d.source.isHovered || d.target.isHovered ? 1 : 0)
      })
      .on("mouseleave", (event, data) => {
        // Handle mouse leave...
        data.isHovered = false
        elementTitle.value = "No item selected"
        elementColor.value = "#331917"
        connections.value = []
        data.connectedElementIds.forEach(id => {
          const connectedElement = elements.value.find(e => e.id === id);
          if (connectedElement) connectedElement.connectionIsHovered = false;
        });
        circles
            .style("stroke", "#331917")
            .style("fill", "transparent")
        lines.style("opacity", 0)
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
  if (add(0, 0)) return {x, y}
  while (distance < grid.length) {
    distance++;
    const length = distance * 2 - 1
    for (let i = 0; i <= length; i++) if (add(-distance + i, distance)) return {x, y};
    for (let i = 0; i <= length; i++) if (add(distance, distance - i)) return {x, y};
    for (let i = 0; i <= length; i++) if (add(-distance, -distance + i)) return {x, y};
    for (let i = 0; i <= length; i++) if (add(distance - i, -distance)) return {x, y};
  }
}

function createFakeData(numElements = 150) {
  const categories = [
      {title: 'image', parentCategory: null},
    {title: 'text', parentCategory: null},
    {title: 'symbol', parentCategory: null},
    {title: 'theory', parentCategory: null},
    {title: 'test 1', parentCategory: {title: 'theory', parentCategory: null}},
    {title: 'test 2', parentCategory: {title: 'theory', parentCategory: null}},
    {title: 'test 3', parentCategory: {title: 'theory', parentCategory: null}},
    {title: 'test 4', parentCategory: {title: 'theory', parentCategory: null}},
    {title: 'test 5', parentCategory: {title: 'image', parentCategory: null}},
    {title: 'test 6', parentCategory: {title: 'image', parentCategory: null}},
    {title: 'test 7', parentCategory: {title: 'image', parentCategory: null}},
    {title: 'test 8', parentCategory: {title: 'image', parentCategory: null}},
    {title: 'test 9', parentCategory: {title: 'image', parentCategory: null}},
    {title: 'test 10', parentCategory: {title: 'text', parentCategory: null}},
    {title: 'test 11', parentCategory: {title: 'text', parentCategory: null}},
    {title: 'test 12', parentCategory: {title: 'text', parentCategory: null}},
    {title: 'test 13', parentCategory: {title: 'text', parentCategory: null}},
    {title: 'test 14', parentCategory: {title: 'text', parentCategory: null}},
    {title: 'test 15', parentCategory: {title: 'symbol', parentCategory: null}},
    {title: 'test 16', parentCategory: {title: 'symbol', parentCategory: null}},
    {title: 'test 17', parentCategory: {title: 'symbol', parentCategory: null}},
    {title: 'test 18', parentCategory: {title: 'symbol', parentCategory: null}}
  ]

  // Helper function to generate random number
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate elements
  const elements = Array.from({length: numElements}, (_, i) => {
    const category = categories[getRandomInt(0, categories.length - 1)];
    return {
      id: i,
      title: `Element ${i}`,
      category: category,
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
#map-container {
  display: flex;
  height: calc(100vh - 66px);
  overflow-y: hidden;
  padding: 0 10px 10px 10px;
}

#side {
  flex: 1;
  flex-shrink: 0;
}

.legend {
  position: absolute;
  bottom: 10px;
}

.legend p {
  padding: 10px;
  border-radius: 10px;
  font-size: 20px;
  white-space: nowrap;
  margin-bottom: 0 !important;
}

#text {
  outline: 2px solid #1EB5E4;
}
#symbol {
  outline: 2px solid #FE4936;
}
#image {
  outline: 2px solid #6EBD1E;
}
#theory {
  outline: 2px solid #E3FA5B;
}

#title {
  color: v-bind(elementColor);
}

#map {
  background-color: #CBCACA;
  flex: 5;
  border: 2px solid var(--pri);
}
text {
  text-transform: uppercase;
}
.connected-items {
  font-size: 20px;
}
@media screen and (max-width: 1000px) {
  #map-container {
    flex-direction: column;
  }
  #side {
    display: none;
  }
}
</style>