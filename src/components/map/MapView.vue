<template>
  <div id="map-container">
    <aside id="side">
      <p class="big-type" id="title">{{ elementTitle }}</p>
      <p class="big-type">Connected Items:</p>
      <template v-if="connections.length">
        <span v-for="connection in connections">{{ connection.related_item_id.title }}<br></span>
      </template>
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
  elements.value = JSON.parse(JSON.stringify(await store.getItems))
  // elements.value = createFakeData(50)
  const categories = await store.getCategories
  // const categories = [
  //   {title: 'image', parentCategory: null},
  //   {title: 'text', parentCategory: null},
  //   {title: 'symbol', parentCategory: null},
  //   {title: 'person', parentCategory: null},
  //   {title: 'test 1', parentCategory: {title: 'person', parentCategory: null}},
  //   {title: 'test 2', parentCategory: {title: 'person', parentCategory: null}},
  //   {title: 'test 3', parentCategory: {title: 'person', parentCategory: null}},
  //   {title: 'test 4', parentCategory: {title: 'person', parentCategory: null}},
  //   {title: 'test 5', parentCategory: {title: 'image', parentCategory: null}},
  //   {title: 'test 6', parentCategory: {title: 'image', parentCategory: null}},
  //   {title: 'test 7', parentCategory: {title: 'image', parentCategory: null}},
  //   {title: 'test 8', parentCategory: {title: 'image', parentCategory: null}},
  //   {title: 'test 9', parentCategory: {title: 'image', parentCategory: null}},
  //   {title: 'test 10', parentCategory: {title: 'text', parentCategory: null}},
  //   {title: 'test 11', parentCategory: {title: 'text', parentCategory: null}},
  //   {title: 'test 12', parentCategory: {title: 'text', parentCategory: null}},
  //   {title: 'test 13', parentCategory: {title: 'text', parentCategory: null}},
  //   {title: 'test 14', parentCategory: {title: 'text', parentCategory: null}},
  //   {title: 'test 15', parentCategory: {title: 'symbol', parentCategory: null}},
  //   {title: 'test 16', parentCategory: {title: 'symbol', parentCategory: null}},
  //   {title: 'test 17', parentCategory: {title: 'symbol', parentCategory: null}},
  //   {title: 'test 18', parentCategory: {title: 'symbol', parentCategory: null}}
  // ]

  dimensions.value.width = map.value.clientWidth
  dimensions.value.height = map.value.clientHeight

  const mainCategoryCounts = categories.reduce((acc, cat) => {
    let key = cat.parentCategory ? cat.parentCategory.title : cat.title;
    acc[key] = (acc[key] || [])
    acc[key].push(cat)

    return acc;
  }, {});

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
    element.color = (getColorsOfCategory(category)).highlight

    element.connectedElementIds = element.references.map(ref => ref.related_item_id.id);
  })


  // Determine grid size based on the category with the most elements
  const gridSize = Math.ceil(Math.sqrt(Math.max(...Object.values(categoryCounts)) * 10));

  // Create the grid
  const grid = Array.from({length: gridSize}, () => Array(gridSize).fill(null));


  const minRadius = 10

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
    element.radiusSize = element.referenceCount * 6 + minRadius

    element.references.forEach(reference => {
      let relatedElement = elements.value.find(e => e.id === reference.related_item_id.id);
      if (relatedElement) {
        linesData.push({source: element, target: relatedElement});
      }
    });
  });

  const categoryBasePositions = {};

  const categoryQuadrants = {
    text: {
      top: 0,
      left: 0,
      right: dimensions.value.width / 2,
      bottom: dimensions.value.height / 2
    },
    symbol: {
      top: 0,
      left: dimensions.value.width / 2,
      right: dimensions.value.width,
      bottom: dimensions.value.height / 2
    },
    person: {
      top: dimensions.value.height / 2,
      left: dimensions.value.width / 2,
      right: dimensions.value.width,
      bottom: dimensions.value.height
    },
    image: {
      top: dimensions.value.height / 2,
      left: 0,
      right: dimensions.value.width / 2,
      bottom: dimensions.value.height
    },
  }

  for (const key in categoryQuadrants) {
    const count = mainCategoryCounts[key].length
    const amntX = Math.ceil(Math.sqrt(count))
    const amntY = Math.ceil(count / amntX)
    const width = dimensions.value.width / (2 * amntX)
    const height = dimensions.value.height / (2 * amntY)
    const top = categoryQuadrants[key].top
    const left = categoryQuadrants[key].left

    for (let i = 0; i < count; i++) {
      const cat = mainCategoryCounts[key][i].title

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
        let relatedCategory = relatedElement.category.parentCategory
            ? relatedElement.category.parentCategory.title
            : relatedElement.category.title;
        xSum += categoryBasePositions[relatedCategory].x;
        ySum += categoryBasePositions[relatedCategory].y;
        count++;
      }
    });
    let avgPosition = {
      x: count > 0 ? basePosition.x + ((xSum / count) - basePosition.x) / 6 : basePosition.x,
      y: count > 0 ? basePosition.y + ((ySum / count) - basePosition.y) / 6 : basePosition.y,
    };
    // let avgPosition = {
    //   x: basePosition.x,
    //   y: basePosition.y,
    // };

    // Map weighted position to grid cell
    let cellPosition = {
      x: Math.floor((avgPosition.x / dimensions.value.width) * gridSize),
      y: Math.floor((avgPosition.y / dimensions.value.height) * gridSize),
    };
    // Get closest available cell
    let availableCell = getClosestAvailableCell(grid, cellPosition.x, cellPosition.y);

    // Assign element to grid cell
    grid[availableCell.x][availableCell.y] = element;

    // Update element's position to the center of the grid cell
    element.x = (availableCell.x + 0.5) * (dimensions.value.width / gridSize);
    element.y = (availableCell.y + 0.5) * (dimensions.value.height / gridSize);
  });


  elements.value.sort((a, b) => b.radiusSize - a.radiusSize)

  // Convert your object into an array of objects
  let categoriesArray = Object.entries(categoryBasePositions).map(([category, position]) => ({
    category,
    ...position,
  }));


  for (const category in categories) {
    const c = categories[category]
    let boundaryNodes = [];
    let outerShapePath = d3.path();
    const title = c.title
    const mainCat = c.parentCategory ? c.parentCategory.title : c.title
    const col = (getColorsOfCategory(mainCat)).highlight

// Calculate boundary nodes
    const margin = 20

    for (let i = 0; i < grid.length; i++) {
      let col = grid[i];
      col = col.filter(el => el && el.category.title === title)
      let minNode = col[d3.minIndex(col, d => d ? d.y : Infinity)];
      let maxNode = col[d3.maxIndex(col, d => d ? d.y : -1)];
      let minN, maxN
      if( minNode ) {
        minN = JSON.parse(JSON.stringify(minNode))
        maxN = JSON.parse(JSON.stringify(maxNode))
        const minRad = margin + minN.radiusSize
        const maxRad = margin + maxN.radiusSize
        minN.outlinePos = {x: minN.x,y:  minN.y - minRad}
        maxN.outlinePos = {x: maxN.x,y:  maxN.y + maxRad}
        boundaryNodes.push(minN, maxN)
      }
    }
    for (let i = 0; i < grid[0].length; i++) {
      let row = grid.map(col => col[i]);
      row = row.filter(el => el && el.category.title === title)
      let minNode = row[d3.minIndex(row, d => d ? d.x : Infinity)];
      let maxNode = row[d3.maxIndex(row, d => d ? d.x : -1)];
      let minN, maxN
      if( minNode ) {
        minN = JSON.parse(JSON.stringify(minNode))
        maxN = JSON.parse(JSON.stringify(maxNode))
        const minRad = margin + minN.radiusSize
        const maxRad = margin + maxN.radiusSize
        minN.outlinePos = {x: minN.x - minRad,y:  minN.y}
        maxN.outlinePos = {x: maxN.x + maxRad,y:  maxN.y}
        boundaryNodes.push(minN, maxN)
      }
    }
    const avgNodes = (function (arr) {
      let m = {}, newarr = []
      for (let i = 0; i < arr.length; i++) {
        let v = arr[i];
        if (!m[v.id]) {
          newarr.push(v);
          m[v.id] = true;
        }
      }
      return newarr;
    })(boundaryNodes);


    const avgX = avgNodes.reduce(function (p, c, i) {
      return p + (c.x - p) / (i + 1)
    }, 0)
    const avgY = avgNodes.reduce(function (p, c, i) {
      return p + (c.y - p) / (i + 1)
    }, 0)

// Sort nodes clockwise
    boundaryNodes.sort((a, b) => Math.atan2( a.outlinePos.y - avgY, a.outlinePos.x - avgX) - Math.atan2(b.outlinePos.y - avgY, b.outlinePos.x - avgX));

// Draw shape
    for (let i = 0; i < (boundaryNodes.length !== 0 ? boundaryNodes.length + 1 : 0); i++) {
      const index = i % (boundaryNodes.length)
      let node = boundaryNodes[index];
      let prevNode = boundaryNodes[index - 1] || boundaryNodes[boundaryNodes.length - 1];
      let deltaX = node.outlinePos.x - prevNode.outlinePos.x
      let deltaY = node.outlinePos.y - prevNode.outlinePos.y
      let handleX, handleY

      if((deltaX > 0 && deltaY > 0) || (deltaX < 0 && deltaY < 0)) {
        handleX = node.outlinePos.x
        handleY = prevNode.outlinePos.y
      }  else {
        handleX = prevNode.outlinePos.x
        handleY = node.outlinePos.y
      }

      if(i === 0) {
        outerShapePath.moveTo(node.outlinePos.x, node.outlinePos.y)
      } else {
        outerShapePath.quadraticCurveTo(handleX, handleY, node.outlinePos.x, node.outlinePos.y)
      }

    }
    outerShapePath.closePath()
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

  // Create a text label for each category
  svg.selectAll("text")
      .data(categoriesArray)
      .enter()
      .append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text(d => d.category)
      .attr("font-family", "Lunchtype, sans-serif")  // Set the font as you need
      .attr("font-size", d => Object.keys(categoryQuadrants).includes(d.category) ? "70px" : "20px")
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
    {title: 'person', parentCategory: null},
    {title: 'test 1', parentCategory: {title: 'person', parentCategory: null}},
    {title: 'test 2', parentCategory: {title: 'person', parentCategory: null}},
    {title: 'test 3', parentCategory: {title: 'person', parentCategory: null}},
    {title: 'test 4', parentCategory: {title: 'person', parentCategory: null}},
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
  height: calc(100vh - 60px);
  overflow-y: hidden;
  padding: 0 10px 10px 10px;
}

#side {
  flex: 1;
  flex-shrink: 0;
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

</style>