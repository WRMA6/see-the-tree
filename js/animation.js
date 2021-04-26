/**
 * @fileoverview Implements functions that animate the trees
 * The D3 library is used extensively throughout
 * 
 * Note: a node's id is its corresponding DOM element's id,
 * while a node's value represents its value in the binary tree.
 * These are usually the same number.
 */

/**
 * Sets up a node to blink and then timer to enable the next step button
 * @param {number} nodeId Id of the node to blink
 */
function drawBlinkSelect(nodeId) {
  setBlinkNode(nodeId);

  setTimeout(() => {enableNext()}, 1000);
}

/**
 * Animates the change of colour for a list of nodes
 * @param {List<List<RbNode|number>>} changeList list of nodes and colours
 */
function drawColourChange(changeList) {
  const changeSpeed = 800;

  changeList.forEach((change) => {
    const node = change[0];
    const colour = change[1];

    const fill = node.fills[colour];
    const stroke = node.strokes[colour];

    d3.select('#node' + node.value)
        .transition().duration(300)
        .style('fill', 'white')
        .style('stroke', 'white')
        .transition().duration(changeSpeed)
        .style('fill', fill)
        .style('stroke', stroke);

    d3.select('#text' + node.value)
        .transition().duration(300)
        .style('fill', 'white')
        .style('stroke', 'white')
        .transition().duration(changeSpeed)
        .style('fill', stroke)
        .style('stroke', stroke);
  })

  setTimeout(() => {enableNext()}, changeSpeed);
}

/**
 * Draws the animation in which a node is removed from the tree
 * @param {number} nodeId Id of the node to remove
 * @param {boolean} hasSubtree Whether the node to delete has non-null children
 */
function drawDelete(nodeId, hasSubtree) {
  d3.select('#node' + nodeId)
    .transition().duration(500).style('opacity', 0)
    .transition().remove();
  d3.select('#text' + nodeId)
    .transition().duration(500).style('opacity', 0)
    .transition().remove();
  d3.selectAll('.link' + nodeId)
    .transition().duration(500).style('opacity', 0)
    .transition().remove();

  // Use classes added to link elements to find relevant ones to move/remove
  if (hasSubtree) {
    const nodesToConnect = [];
    document.querySelectorAll('.link' + nodeId).forEach((link) => {
      const linkEnds = link.classList;
      linkEnds.forEach((className) => {
        const linkId = parseInt(className.replace('link', ''));
        if (linkId != nodeId) {
          nodesToConnect.push(linkId);
        }
      });
    });

    // If node was root node, list will not have a "start" id
    if (nodesToConnect.length === 2) {
      const startNode = Global.simulationData.nodes.find(x => x.id === nodesToConnect[0]);
      const endNode = Global.simulationData.nodes.find(x => x.id === nodesToConnect[1]);

      const newLink = Global.svg
        .append('polyline')
        .style('stroke', 'gray')
        .style('stroke-width', 2)
        .attr('points', pointsToString(startNode, endNode))
        .style('opacity', 0);

      if (getTreeType() === 'Avl' || getTreeType() === 'RedBlack') {
        newLink.attr('marker-mid', 'url(#marker)');
      }

      d3.select('#node' + nodesToConnect[0]).raise();
      d3.select('#node' + nodesToConnect[1]).raise();
      d3.select('#text' + nodesToConnect[0]).raise();
      d3.select('#text' + nodesToConnect[1]).raise();

      setTimeout(() => {
        newLink.transition().duration(1000).style('opacity', 1);
      }, 500);
    }
  }

  setTimeout(() => {
    animate();
  }, 1000 + hasSubtree ? 1500 : 0);
}

/**
 * Draws movement of the marker node representing what the algorithm is doing
 * @param {number} sourceId The id that the marker itself carries
 * @param {number} targetId The id of the node to move the marker to
 * @param {Object} settings Object specifying styles in the marker
 */
function drawMovement(sourceId, targetId, settings) {
  let time = 0;

  const targetNode = Global.simulationData.nodes.find(x => x.id === targetId);
  let sourceNode;
  let newNode;
  let newText;

  // Red-Black tree nodes require colour to be identified dynamically
  let visualSourceNode = d3.select('#node' + sourceId);
  if (!visualSourceNode.empty()) {
    settings.fillColour = visualSourceNode.style('fill');
    settings.textColour = visualSourceNode.style('stroke');
  }

  // If the node is already on the screen from a previous call
  if (Global.movementNodeInfo == null) {
    sourceNode = {
      'id': sourceId,
      'x': Global.width / 2 + Global.margin,
      'y': -100
    };

    newNode = Global.svg
        .selectAll('none')
        .data([sourceNode])
        .enter()
        .append('circle')
        .attr('r', settings.nodeSize)
        .style('fill', settings.fillColour)
        .style('stroke', settings.textColour)
        .style('stroke-width', 2)
        .style('opacity', Global.operation === 'DELETE' ? 0.5 : 1);

    newText = initializeText(Global.svg, {'nodes':[sourceNode]}, settings);
  }
  else {
    const nodeInfo = Global.movementNodeInfo;
    sourceNode = nodeInfo[0];
    newNode = nodeInfo[1];
    newText = nodeInfo[2];
  }

  Global.movementNodeInfo = [sourceNode, newNode, newText, targetNode];

  // Offset marker to one side of target, depending on the side of the screen
  sourceNode.targetX = targetNode.x;
  sourceNode.targetY = targetNode.y;
  if (sourceId !== targetId) {
    if (sourceNode.targetX > Global.width / 2 + Global.margin) {
      sourceNode.targetX -= (settings.nodeSize + 5);
    }
    else {
      sourceNode.targetX += (settings.nodeSize + 5);
    }
  }
  sourceNode.forceX = 0;
  sourceNode.forceY = 0;

  let simulation = d3.forceSimulation([sourceNode])
    .on('tick', ticked);
  
  simulation = addDefaultSimulationForces(simulation);

  function ticked() {
    newNode
        .attr('cx', (d) => { return d.x; })
        .attr('cy', (d) => { return d.y; });

    newText
        .attr('x', (d) => { return d.x; })
        .attr('y', (d) => { return d.y; });

    if (time % 5 == 0) {
      let delta = 0.05;
      sourceNode.forceY += delta;
      sourceNode.forceX += delta;
      simulation.force('y').initialize([sourceNode]);
      simulation.force('x').initialize([sourceNode]);
    }

    simulation.stop();

    if (time < 100 && simulation.alpha() > 0.1) {
      setTimeout(() => {
        time++;
        simulation.tick();
        ticked();
      }, 12);
    }
    else {
      if (sourceId === targetId) {
        newNode.remove();
        newText.remove();
        Global.movementNodeInfo = null;
      }
      enableNext();
    }
  }
}

/**
 * @param {List<*>} args Arguments identify node to rotate around, parent, etc.
 */
function drawRotation(args) {
  const data = Global.simulationData;
  const topNode = data.nodes.find(x => x.id === args[0]);
  const bottomNode = data.nodes.find(x => x.id === args[1]);
  
  let subtree = null;
  if (args[2] != null) {
    subtree = data.nodes.find(x => x.id === args[2]);
  }

  d3.select(`.link${args[0]}.link${args[1]}`)
    .transition().duration(1000)
    .attr('transform', `rotate(180, ${(topNode.x + bottomNode.x)/2}, ${(topNode.y + bottomNode.y)/2})`);

  if (subtree != null) {
    d3.select(`.link${args[1]}.link${args[2]}`)
      .transition().duration(1000)
      .attr('points', pointsToString(topNode, subtree));
  }

  let parentNode = null;
  if (args[3] != null) {
    parentNode = data.nodes.find(x => x.id === args[3]);
  }

  if (parentNode != null) {
    d3.select(`.link${args[0]}.link${parentNode.id}`)
      .transition().duration(1000)
      .attr('points', pointsToString(parentNode, bottomNode));
  }

  // Save the positions of all nodes currently for the next animation
  Global.nodePositions = mapNodePositions();
  Global.simulationData = generateDrawObject(args[4].root, null);
  setNodePositions();

  setTimeout(() => {
    drawTree(null, getSettings(), 'ROTATION');
  }, 1500);
}

/**
 * Highlights a node, representing where the search algorithm is currently at
 * @param {number} nodeId Node to be highlighted
 */
function drawSearch(nodeId) {
  unhighlightNodes();
  highlightNode(nodeId);
  setTimeout(() => {
    enableNext();
  }, 500);
}

/**
 * Animates the value of a node changing
 * @param {number} nodeId Id of a node
 * @param {number} nodeValue Value to set that node to
 */
function drawSwap(nodeId, nodeValue) {
  unhighlightNodes();
  d3.select('#text' + nodeId)
    .transition().duration(400).style('opacity', 0)
    .transition().duration(800).text(nodeValue).style('opacity', 1);

  // Create a map containing updated positions of nodes after swap
  const positions = mapNodePositions();
  positions.set(nodeValue, positions.get(nodeId));
  Global.nodePositions = positions;

  setTimeout(() => {
    enableNext();
  }, 1200);
}

/**
 * Function usually used to straighten out a tree to its default position
 * @param {Bst|Avl|RedBlack} tree Tree to animate
 * @param {Object} settings Object specifying styles in the tree nodes
 * @param {string} actionType Helps decide certain variables within animation
 */
function drawTree(tree, settings, actionType) {
  let data = Global.simulationData;
  if (data == null) {
    data = generateDrawObject(tree.root, null);
    Global.simulationData = data;
  }

  let time = 0;
  let maxTime = 100;
  if (actionType === 'NEWTREE') {
    maxTime += data.nodes.length*1.5;
  }

  // Scale link length with screen size and tree size
  let linkLength = Global.area / 10000;
  if (data.treeHeight < 4) {
    linkLength = Global.area / 2500;
  }

  calculateNodePositions(data, 'DRAWTREE');

  const svg = resetSvg();

  const link = initializeLinks(svg, data);

  const node = initializeNodes(svg, data, settings);

  const text = initializeText(svg, data, settings);

  adjustNodeZHeights(data.nodes);
  rehighlightNodes();

  let simulation;
  if (actionType === 'APPEND' || actionType === 'RESIZE' || actionType === 'ROTATION') {
    simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink().distance(linkLength).strength(0)
        .id((d) => { return d.id; })
        .links(data.links)
      )
      .force('collide', d3.forceCollide(1))
      .on('tick', ticked);
    
    simulation = addDefaultSimulationForces(simulation);
  }
  else {
    simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink().distance(linkLength).strength(0.3)
        .id((d) => { return d.id; })
        .links(data.links)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .on('tick', ticked);
    
    simulation = addDefaultSimulationForces(simulation);
  }

  function ticked() {
    link.attr('points', (d) => {return pointsToString(d.source, d.target);});

    node
      .attr('cx', (d) => { return d.x; })
      .attr('cy', (d) => { return d.y; });

    text
      .attr('x', (d) => { return d.x; })
      .attr('y', (d) => { return d.y; });

    // Change forces over time, ensuring tree reaches desired final position
    if (time % 3 == 0) {
      let delta = 0.02;
      if (actionType === 'NEWTREE') {
        delta += Math.pow(time, 1.6) * 0.002;
      }
      data.nodes.forEach((n) => {
        n.forceY = n.forceY + delta, 100;
        n.forceX = n.forceX + delta, 100;
      });
      simulation.force('y').initialize(data.nodes);
      simulation.force('x').initialize(data.nodes);
      
      if (actionType === 'NEWTREE') {
        const chargeStrength = Math.max(
            simulation.force('charge').strength()*(time/maxTime) - 0.2, 0
        );
        simulation.force('charge').strength(chargeStrength);
      }
    }

    simulation.stop();

    if (time < maxTime && simulation.alpha() > 0.008) {
      setTimeout(() => {
        time++;
        simulation.tick();
        ticked();
      }, 12);
    }
    else {
      if ((getTreeType() === 'Avl' || getTreeType() === 'RedBlack')
          && (actionType === 'APPEND' || actionType === 'ROTATION' 
              || (Global.operation === 'DELETE' && actionType === 'RESIZE')))
      {
        enableNext();
      }
      else {
        animate(tree || Global.tree);
      }
    }
  }
}

/**
 * Refreshes DOM elements to ensure they have the right id/classes
 * Redraws entire tree, but should be used in a way that does not reveal this
 * @param {?(Bst|Avl|RedBlack)} tree Tree to redraw
 */
function refreshScreen(tree) {
  const svg = resetSvg();

  if (tree == null) {
    if (Global.tree == null) {
      Global.simulationData = null;
      return;
    }
    else {
      tree = Global.tree;
    }
  }

  if (tree.root == null) {
    return;
  }

  const settings = getSettings();

  let data = generateDrawObject(tree.root, null);
  Global.simulationData = data;

  calculateNodePositions(data, 'RESET');

  const link = initializeLinks(svg, data);

  const node = initializeNodes(svg, data, settings);

  const text = initializeText(svg, data, settings);

  adjustNodeZHeights(data.nodes);

  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink().distance(100).strength(0)
      .id((d) => { return d.id; })
      .links(data.links)
    )
    .force('x', d3.forceX()
      .x((d) => { return d.x; }))
    .force('y', d3.forceY()
      .y((d) => { return d.y; }))
    .on('tick', ticked);
  
  simulation.tick();

  function ticked() {
    link.attr('points', (d) => {return pointsToString(d.source, d.target);});

    node
      .attr('cx', (d) => { return d.x; })
      .attr('cy', (d) => { return d.y; });
  
    text
      .attr('x', (d) => { return d.x; })
      .attr('y', (d) => { return d.y; });
    
    simulation.stop();
  }
}

/** Helpers */

/**
 * Adds the initial forces and final positions to the tree simulation
 * @param {d3.ForceSimulation} simulation D3 simulation object
 * @returns {d3.ForceSimulation} Returns simulation with added forces
 */
function addDefaultSimulationForces(simulation) {
  simulation
      .force('x', d3.forceX()
          .x((d) => { return d.targetX; })
          .strength((d) => { return d.forceX; }))
      .force('y', d3.forceY()
          .y((d) => { return d.targetY; })
          .strength((d) => { return d.forceY; }));

  return simulation;
}

/**
 * Ensures that the text is always on same level as corresponding node
 * @param {Object} nodes List of simulation data nodes
 */
function adjustNodeZHeights(nodes) {
  nodes.forEach((n) => {
    d3.select('#node' + n.id).raise();
    d3.select('#text' + n.id).raise();
  });
}

/**
 * Function that toggles colour of a blinking node, calling itself as required
 */
function blinkNode() {
  const nodeInfo = Global.blinkNode;
  if (nodeInfo == null) {
    return;
  }
  
  // Hard-coded animation time
  const animationTime = 800;

  let fill = Tree.highlightFill;
  let stroke = Tree.highlightStroke;
  if (nodeInfo[1] === true) {
    fill = nodeInfo[2];
    stroke = nodeInfo[3];
  }

  d3.select('#node' + nodeInfo[0]).transition()
      .duration(animationTime)
      .style('fill', fill)
      .style('stroke', stroke);

  d3.select('#text' + nodeInfo[0]).transition()
      .duration(animationTime)
      .style('fill', stroke)
      .style('stroke', stroke);

  Global.blinkNode[1] = Global.blinkNode[1] ? false : true;

  setTimeout(() => {
    blinkNode();
    }, animationTime);
}

/**
 * Scales node positions relative to screen
 * @param {Object} data Simulation data object for a tree
 * @param {string} type Type of animation this is for
 */
function calculateNodePositions(data, type) {
  const width = Global.width;
  const height = Global.height;
  const margin = Global.margin;

  data.nodes.forEach((n) => {
    if (type === 'DRAWTREE') {
      if (n.x == null) {
        n.x = Math.round(
            2 * n.xpos * (width / Math.pow(2, n.ypos - 1)) + width / 2)
            + margin;
        n.y = -200 + n.ypos * 20 + margin;
      }
      n.targetY = 
        Math.round(((n.ypos - 0.5) * height) / data.treeHeight) + margin;
      n.targetX = Math.round(
        (n.xpos / 2.0) * (width / Math.pow(2, n.ypos - 1)) + width / 2)
        + margin;
    }
    else if (type === 'RESET') {
      n.y = Math.round(((n.ypos - 0.5) * height) / data.treeHeight) + margin;
      n.x = Math.round(
          (n.xpos / 2.0) * (width / Math.pow(2, n.ypos - 1)) + width / 2)
          + margin;
    }
    n.forceY = 0;
    n.forceX = 0;
  });
}

/**
 * Clears any old information objects after an animation sequence
 */
function clearTreeAnimationProperties() {
  Global.movementNodeInfo = null;
  Global.nodePositions = null;
}

/**
 * Updates simulation data before a delete animation
 * @param {Bst|Avl|RedBlack} tree 
 */
function formatDeleteData(tree) {
  if (Global.nodePositions == null) {
    Global.nodePositions = mapNodePositions();
  }

  Global.simulationData = generateDrawObject(tree.root, null);

  setNodePositions();
}

/**
 * Updates simulation data before an insert animation
 * @param {string} position Position of new node relative to parent
 */
function formatInsertData(position) {
  const newNode = Global.movementNodeInfo[0];
  const parentNode = Global.movementNodeInfo[3];

  if (position === 'LEFT') {
    Global.simulationData.nodes.push({ 
        'id': newNode.id, 
        'x': newNode.x, 
        'y': newNode.y, 
        'ypos': parentNode.ypos + 1, 
        'xpos': parentNode.xpos * 2 - 1,
    });
  }
  else if (position === 'RIGHT') {
    Global.simulationData.nodes.push({ 
        'id': newNode.id, 
        'x': newNode.x, 
        'y': newNode.y, 
        'ypos': parentNode.ypos + 1, 
        'xpos': parentNode.xpos * 2 + 1,
    });
  }

  Global.simulationData.links.push({ 'source': parentNode.id, 'target': newNode.id });
}

/**
 * Adds xpos and ypos attributes for each node in simulation data
 * @param {Object} node Simulation data node
 * @param {Object} data Simulation data
 * @param {number=} xpos Horizontal position of node at its depth
 * @param {number=} ypos Depth of node
 * @returns 
 */
function generateDrawObject(node, data, xpos = 0, ypos = 1) {
  if (data == null) {
    data = { 'nodes': [], 'links': [], 'treeHeight': 0 };
  }

  let fill = null;
  let stroke = null;
  if (Number.isInteger(node.colour)) {
    fill = node.fills[node.colour];
    stroke = node.strokes[node.colour];
  }

  data.nodes.push({ 
      'id': node.value, 
      'ypos': ypos, 
      'xpos': xpos, 
      'fill': fill, 
      'stroke': stroke,
    });
  data.treeHeight = Math.max(data.treeHeight, ypos);

  if (node.left !== null) {
    data.links.push({ 'source': node.value, 'target': node.left.value });
    generateDrawObject(node.left, data, xpos * 2 - 1, ypos + 1);
  }

  if (node.right != null) {
    data.links.push({ 'source': node.value, 'target': node.right.value });
    generateDrawObject(node.right, data, xpos * 2 + 1, ypos + 1);
  }

  return data;
}

/**
 * @param {Object} link Link object from simulation data
 * @returns {string} String of classes to be assigned to the DOM element
 */
function getLinkClasses(link) {
  // Link object starts with number source/targets, but D3 updates them to the
  // actual simulation data node objects after a simulation
  if (link.source === Object(link.source)) {
    return 'link' + link.source.id + ' link' + link.target.id;
  }
  else {
    return 'link' + link.source + ' link' + link.target;
  }
}

/**
 * @param {number} id Id of node element to highlight
 */
function highlightNode(id) {
  const fill = Tree.highlightFill;
  const stroke = Tree.highlightStroke;

  const node = d3.select('#node' + id);
  const oldFill = node.style('fill');
  const oldStroke = node.style('stroke');

  node.transition()
      .duration(200)
      .style('fill', fill)
      .style('stroke', stroke);

  d3.select('#text' + id).transition()
      .duration(200)
      .style('fill', stroke)
      .style('stroke', stroke);

  Global.highlightedNode = [id, oldFill, oldStroke];
}

/**
 * Adds tree link elements to target SVG
 * @param {d3.selection} svg D3 selection of target SVG element
 * @param {Object} data Simulation data object with information about links
 * @returns {d3.selection} The link elements added to the SVG
 */
function initializeLinks(svg, data) {
  const link = svg
      .selectAll('none')
      .data(data.links)
      .enter()
      .append('polyline')
      .attr('class', (d) => { return getLinkClasses(d); })
      .style('stroke', 'gray')
      .style('stroke-width', 2)

  if (getTreeType() === 'Avl' || getTreeType() === 'RedBlack') {
    link.attr('marker-mid', 'url(#marker)');
  }

  return link;
}

/**
 * Adds tree node elements to target SVG
 * @param {d3.selection} svg D3 selection of target svg element
 * @param {Object} data Simulation data object with information about nodes
 * @param {Object} settings Object specifying certain node styles
 * @returns The node elements added to the SVG
 */
function initializeNodes(svg, data, settings) {
  const node = svg
      .selectAll('none')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', settings.nodeSize)
      .attr('id', (d) => { return 'node' + d.id; })
      .style('fill', (d) => { return d.fill || settings.fillColour;})
      .style('stroke', (d) => { return d.stroke || settings.textColour; })
      .style('stroke-width', 2);

  return node;
}

/**
 * Adds text elements to target SVG
 * @param {d3.selection} svg D3 selection of target svg element
 * @param {Object} data Simulation data object with information about nodes
 * @param {Object} settings Object specifying certain text styles
 * @returns The text elements added to the SVG
 */
function initializeText(svg, data, settings) {
  const text = svg
      .selectAll('none')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('id', (d) => { return 'text' + d.id; })
      .attr('font-size', settings.nodeSize - 2)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('font-family', '\'Open Sans\', sans-serif')
      .attr('font-weight', 600)
      .style('stroke', (d) => { return d.stroke || settings.textColour; })
      .style('fill', (d) => { return d.stroke || settings.textColour; })
      .text((d) => { return d.id; });

  return text;
}

/**
 * @returns {Map} Map containing coordinates for each node id
 */
function mapNodePositions() {
  const positions = new Map();
  Global.simulationData.nodes.forEach((n) => {
    positions.set(n.id, [n.x, n.y]);
  });

  return positions;
}

/**
 * @param {Object} source Simulation data object for the source node of a link
 * @param {Object} target Simulation data object for the target node of a link
 * @returns {string} The coordinates string required to draw a link
 */
function pointsToString(source, target) {
  return source.x + ',' + source.y + ' ' +
      (source.x + target.x) / 2 + ',' +
      (source.y + target.y) / 2 + ' ' +
      target.x + ',' + target.y;
}

/**
 * Rehighlights any nodes that should be highlighted, ex. after refreshScreen()
 */
function rehighlightNodes() {
  if (Global.highlightedNode == null) {
    return;
  }
  else {
    const nodeInfo = Global.highlightedNode;
    const nodeId = nodeInfo[0];
    const fill = nodeInfo[1];
    const stroke = nodeInfo[2];

    d3.select('#node' + nodeId)
        .style('fill', fill)
        .style('stroke', stroke);

    d3.select('#text' + nodeId)
        .style('fill', stroke)
        .style('stroke', stroke);
  }
}

/**
 * Clears the SVG element and reinitializes the marker element
 * @returns {d3.selection} The global SVG element that was just reset
 */
function resetSvg() {
  const svg = Global.svg;
  svg.selectAll('*').remove();

  svg.append('defs').append('marker')
    .attr('id', 'marker')
    .attr('viewBox', '0 -5 10 10')
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .style('stroke', 'gray')
    .style('fill', 'gray');
  
  return svg;
}

/**
 * Saves info of blinked node, and calls the self-calling blink function
 * @param {number} nodeId Id of a node 
 */
function setBlinkNode(nodeId) {
  unblinkNodes();

  const node = d3.select('#node' + nodeId);
  const fill = node.style('fill');
  const stroke = node.style('stroke');

  Global.blinkNode = [nodeId, false, fill, stroke];

  blinkNode();
}

/**
 * Consumes the map of node positions to update simulation data
 */
function setNodePositions() {
  Global.simulationData.nodes.forEach((node) => {
    const coordinates = Global.nodePositions.get(node.id);
    node.x = coordinates[0];
    node.y = coordinates[1];
  });

  Global.nodePositions = null;
}

/**
 * Removes blink node info object, stopping self-calling process
 */
function unblinkNodes() {
  const nodeInfo = Global.blinkNode;
  if (nodeInfo == null) {
    return;
  }

  const nodeId = nodeInfo[0]
  const fill = nodeInfo[2];
  const stroke = nodeInfo[3];

  // Using a 0 second transition overwrites any current transition
  d3.select('#node' + nodeId)
      .transition().duration(0)
      .style('fill', fill)
      .style('stroke', stroke);

  d3.select('#text' + nodeId)
      .transition().duration(0)
      .style('fill', stroke)
      .style('stroke', stroke);

  Global.blinkNode = null;
}

/**
 * Resets styles of highlighted node and removes info object
 */
function unhighlightNodes() {
  if (Global.tree == null || Global.highlightedNode == null) {
    return;
  }

  const nodeInfo = Global.highlightedNode;
  const nodeId = nodeInfo[0];
  const fill = nodeInfo[1];
  const stroke = nodeInfo[2];

  d3.select('#node' + nodeId).transition()
      .duration(500)
      .style('fill', fill)
      .style('stroke', stroke);
  d3.select('#text' + nodeId).transition()
      .duration(500)
      .style('fill', stroke)
      .style('stroke', stroke);

  Global.highlightedNode = null;
}