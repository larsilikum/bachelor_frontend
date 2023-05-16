<template>
  <div ref="myDiagramRef" id="myDiagramDiv" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import go from 'gojs';
import {onMounted, ref} from "vue";
import {useItemStore} from "../../store/index.js";
import {useRouter} from "vue-router";

const itemStore = useItemStore()
const router = useRouter()

const myDiagramRef = ref(null);

const highlightColor = '#ef3920'

class WheelLayout extends go.CircularLayout {
  // override makeNetwork to set the diameter of each node and ignore the TextBlock label
  makeNetwork(coll) {
    const net = super.makeNetwork(coll);
    net.vertexes.each((cv) => (cv.diameter = 20)); // because our desiredSize for nodes is (20, 20)
    return net;
  }

  // override commitNodes to rotate nodes so the text goes away from the center,
  // and flip text if it would be upside-down
  commitNodes() {
    super.commitNodes();
    this.network.vertexes.each((v) => {
      const node = v.node;
      if (node === null) return;
      // get the angle of the node towards the center, and rotate it accordingly
      const a = v.actualAngle;
      if (a > 90 && a < 270) {
        // make sure the text isn't upside down
        const textBlock = node.findObject('TEXTBLOCK');
        textBlock.angle = 180;
      }
      node.angle = a;
    });
  }

  // override commitLinks in order to make sure all of the Bezier links are "inside" the ellipse;
  // this helps avoid links crossing over any other nodes
  commitLinks() {
    super.commitLinks();
    if (this.network.vertexes.count > 4) {
      this.network.vertexes.each((v) => {
        v.destinationEdges.each((de) => {
          const dv = de.toVertex;
          let da = dv.actualAngle;
          let sa = v.actualAngle;
          if (da - sa > 180) da -= 360;
          else if (sa - da > 180) sa -= 360;
          de.link.curviness = sa > da ? 15 : -15;
        });
      });
    }
  }
}

onMounted(async () => {
  const items = await itemStore.fetchItems()
  console.log(items)

  const myDiagram = go.GraphObject.make(go.Diagram, myDiagramRef.value, {
    initialAutoScale: go.Diagram.Uniform,
    padding: 50,
    contentAlignment: go.Spot.Center,
    layout: go.GraphObject.make(WheelLayout, {
      arrangement: go.CircularLayout.ConstantDistance,
      nodeDiameterFormula: go.CircularLayout.Circular,
      spacing: 10,
      aspectRatio: 1,
      sorting: go.CircularLayout.Optimized
    }),
    isReadOnly: true,
    click: (e) => {
      e.diagram.startTransaction('clear');
      e.diagram.clearHighlighteds();
      e.diagram.commitTransaction('clear');
    }
  });

  myDiagram.nodeTemplate = go.GraphObject.make(go.Node, 'Horizontal', {
        selectionAdorned: false,
        locationSpot: go.Spot.Center,
        locationObjectName: 'SHAPE',
        mouseEnter: (e, node) => {
          node.diagram.clearHighlighteds();
          node.linksConnected.each((l) => highlightLink(l, true));
          node.isHighlighted = true;
          const tb = node.findObject('TEXTBLOCK');
          if (tb !== null) {
            tb.stroke = highlightColor;
            tb.opacity = 1;
          }
        },
        mouseLeave: (e, node) => {
          node.diagram.clearHighlighteds();
          const tb = node.findObject('TEXTBLOCK');
          if (tb !== null) {
            tb.stroke = 'transparent';
            tb.opacity = 0;
          }
        },
        click: (e, node) => {
          router.push({name: 'Item', params: {id: node.data.key}})
        }
      }, new go.Binding('text', 'text'),
      go.GraphObject.make(go.Shape, 'Ellipse', {
            name: 'SHAPE',
            fill: 'lightgray',
            stroke: 'transparent',
            strokeWidth: 2,
            desiredSize: new go.Size(10, 10),
            portId: '',
          }, new go.Binding('fill', 'color'),
          new go.Binding('stroke', 'isHighlighted', (h) => (h ? highlightColor : 'transparent')).ofObject(),
          new go.Binding('desiredSize', 'references', (refs) => {
            const size = calculateNodeSize(refs);
            return new go.Size(size, size);
          })),
      go.GraphObject.make(go.TextBlock, {
        name: 'TEXTBLOCK',
        opacity: 0
      }, new go.Binding('text', 'text')));

  function highlightLink(link, show) {
    link.isHighlighted = show;
    link.fromNode.isHighlighted = show;
    link.toNode.isHighlighted = show;
  }

  myDiagram.linkTemplate = go.GraphObject.make(go.Link, {
    routing: go.Link.Normal,
    curve: go.Link.Bezier,
    selectionAdorned: false,
    mouseEnter: (e, link) => highlightLink(link, true),
    mouseLeave: (e, link) => highlightLink(link, false)
  }, go.GraphObject.make(go.Shape, new go.Binding('stroke', 'isHighlighted', (h, shape) => (h ? highlightColor : 'transparent')).ofObject(), new go.Binding('strokeWidth', 'isHighlighted', (h) => (h ? 2 : 1)).ofObject()));


  function generateGraph() {
    const nodeDataArray = items.map((item) => ({
      key: item.id,
      text: item.title,
      color: '#331917',
      references: item.references ? item.references.length : 0
    }));

    const linkDataArray = [];
    items.forEach((item) => {
      item.references.forEach((reference) => {
        linkDataArray.push({
          from: item.id,
          to: reference.related_item_id.id,
          color: go.Brush.randomColor(0, 127)
        });
      });
    });

    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
  }

  function calculateNodeSize(numConnections) {
    if (numConnections === 0) {
      return 10;
    } else if (numConnections === 1) {
      return 11;
    } else {
      return Math.round(Math.pow(1.3, numConnections - 2) * 13);
    }
  }

  generateGraph();
});


</script>
<style>
#myDiagramDiv {
  width: 100%;
  height: calc(100vh - 100px);
  border: 2px solid var(--pri);
}
</style>