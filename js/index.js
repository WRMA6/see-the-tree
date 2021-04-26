/** "Global" variables are referenced through this object */
var Global = {};

/**
 * @fileoverview Controller functions that interact with the three parts of the
 * program: tree classes and algorithms, animations functions, and user inputs
 */


/** Animation Functions */

/**
 * Responsible for calling animation functions based on Global.actionList
 * @param {Bst|Avl|RedBlack} tree Tree to animate
 */
function animate(tree) {
  if (tree == null) {
    tree = Global.tree;
  }

  if (Global.actionList.length === 0) {
    refreshScreen();
    enableButtons(tree);
    return;
  }

  const action = Global.actionList.pop();

  // Simulation adjustment settings
  const settings = getSettings(tree);

  switch (action.id) {
    // Draw new tree
    case 0:
      setCaption(`${getTreeName(tree)} was created.`);
      drawTree(tree, settings, 'NEWTREE');
      break;
    // Append left
    case 1:
      setCaption(`Subtree is empty, append ${action.args[0]} as left child.`);
      formatInsertData('LEFT');
      drawTree(tree, settings, 'APPEND');
      break;
    case 2:
    // Append right
      setCaption(`Subtree is empty, append ${action.args[0]} as right child.`);
      formatInsertData('RIGHT');
      drawTree(tree, settings, 'APPEND');
      break;
    // Check left subtree
    case 3:
      setCaption(`${action.args[0]} < ${action.args[1]}. Check left subtree.`);
      drawMovement(action.args[0], action.args[1], settings);
      break;
    // Check right subtree
    case 4:
      setCaption(`${action.args[0]} > ${action.args[1]}. Check right subtree.`);
      drawMovement(action.args[0], action.args[1], settings);
      break;
    // Adjust tree height
    case 5:
      animateTreeHeightChange(tree, action, settings);
      break;
    // Match node
    case 6:
      setCaption(`Node ${action.args[0]} found.` +
          ` Now find the leftmost node in its right subtree.`);
      drawMovement(action.args[0], action.args[0], settings);
      break;
    // Delete node with subtree
    case 7:
      setCaption(`Replace Node ${action.args[0]} with its one child node.`);
      drawDelete(action.args[0], true);
      break;
    // Delete node with no subtree
    case 8:
      setCaption(`Node ${action.args[0]} can simply be removed because it has`
          + ` no children.`);
      drawDelete(action.args[0], false);
      break;
    // Binary search animation
    case 9:
      drawSearch(action.args[0]);
      break;
    // Swap values
    case 10:
      setCaption(`Set node with value ${action.args[0]} to ${action.args[1]}.`
          + ` Continue tree traversal to delete the duplicate value.`);
      drawSwap(action.args[0], action.args[1]);
      break;
    // Match node before delete
    case 11:
      setCaption(`Node ${action.args[0]} found, remove it from the tree.`);
      drawMovement(action.args[0], action.args[0], settings);
      break;
    // Check balance of node - balanced case
    case 12:
      setCaption(`Check balance of tree rooted at Node ${action.args[0]}:`
          + ` it is balanced.`);
      drawSearch(action.args[0]);
      break;
    // Check balance of node - unbalanced case
    case 13:
      setCaption(`Check balance of tree rooted at Node ${action.args[0]}:`
          + ` rebalancing required.`);
      drawSearch(action.args[0]);
      break;
    // Left rotation
    case 14:
      setCaption(`Perform a left rotation at Node ${action.args[0]}.`);
      drawRotation(action.args);
      break;
    // Right rotation
    case 15:
      setCaption(`Perform a right rotation at Node ${action.args[0]}.`);
      drawRotation(action.args);
      break;
    // Start Red-Black tree rebalancing
    case 16:
      setCaption(`Now fix any tree violations starting with`
          + ` Node ${action.args[0]}.`);
      drawBlinkSelect(action.args[0]);
      break;
    // Red-Black balance step
    case 17:
      setCaption(`Node ${action.args[0].value} is the root,`
          + ` set colour to black.`);
      drawColourChange([[action.args[0], 0]]);
      break;
    // Red-Black balance step
    case 18:
      setCaption(`Parent of Node ${action.args[0]} is black,`
          + ` last step is to change root to black.`);
      drawColourChange([[action.args[1], 0]]);
      break;
    // Red-Black balance step
    case 19:
      setCaption(`Parent of Node ${action.args[0]} is black,`
          + ` no further fixing is required.`);
      setTimeout(() => {enableNext()}, 800);
      break;
    // Red-Black balance step
    case 20:
      setCaption(`Set Node ${action.args[0][0].value} to black,`
          + ` its uncle to black, and its grandparent to red.`);
      drawColourChange(action.args);
      break;
    // Red-Black balance step
    case 21:
      setCaption(`Set grandparent Node ${action.args[0][0].value} to red.`);
      drawColourChange(action.args);
      break;
    // Red-Black balance step
    case 22:
      setCaption(`Set parent Node ${action.args[0][0].value} to black`
          + ` and grandparent Node ${action.args[1][0].value} to red.`);
      drawColourChange(action.args);
      break;
    // Red-Black balance step
    case 23:
      setCaption(`Set Node ${action.args[0]} as the new child`
          + ` (${action.args[1]}) and fix any violations.`);
      drawBlinkSelect(action.args[0]);
      break;
    // Red-Black balance step
    case 24:
      setCaption(`Fix violations, starting from the former position of`
          + ` Node ${action.args[0]} ${action.args[1]}.`);
      enableNext();
      break;
    // Red-Black balance step
    case 25:
      setCaption(`No double black violation.`
          + ` Set Node ${action.args[0][0].value} to black.`);
      drawColourChange(action.args);
      break;
    // Red-Black no rebalancing required
    case 26:
      setCaption(`Tree has no violations as is, no fix required.`);
      enableNext();
      break;
    // Red-Black balance step
    case 27:
      setCaption(`Set parent Node ${action.args[0][0].value} to red`
          + ` and sibling Node ${action.args[1][0].value} to black.`);
      drawColourChange(action.args);
      break;
    // Red-Black balance step
    case 28:
      setCaption(`Set sibling Node ${action.args[0][0].value} to red.`);
      drawColourChange(action.args);
      break;
    // Red-Black balance step
    case 29:
      setCaption(`Tree is almost balanced, just set `
          + `Node ${action.args[0][0].value} ${action.args[1]}to black.`);
      action.args.pop();
      drawColourChange(action.args);
      break;
    // Red-Black balance step
    case 30:
      setCaption(`Set sibling Node ${action.args[0][0].value} to red`
          + ` and its child to black.`);
      drawColourChange(action.args);
      break;
    // Red-Black balance step
    case 31:
      const siblingValue = action.args[0][0].value;
      const siblingColour = action.args[0][1] ? 'red': 'black';
      const parentValue = action.args[1][0].value;
      const siblingChildText = action.args.pop();
      setCaption(`Set sibling Node ${siblingValue} to ${siblingColour}`
          + `${siblingChildText} and parent Node ${parentValue} to black.`);
      drawColourChange(action.args);
      break;
    // End of animation
    case 32:
      setTimeout(() => {
        setCaption(action.args[0]);
        unhighlightNodes();
        unblinkNodes();
        animate();
      }, 1000
      );
      break;
    default:
      break;
  }
}

/**
 * Decision logic for several possible "resize" scenarios
 * @param {Bst|Avl|RedBlack} tree Tree to animate
 * @param {Action} action Current animation sequence action
 * @param {Object} settings Object specifying certain animation styles
 */
function animateTreeHeightChange(tree, action, settings) {
  if (Global.operation === 'INSERT'
      && action.args
      && action.args.length === 1) 
  {
    if (action.args[0] > Global.simulationData.treeHeight) {
      Global.simulationData.treeHeight = action.args[0];
      drawTree(tree, settings, 'RESIZE');
    }
    else {
      animate();
    }
  }
  else if (Global.operation === 'DELETE'
      && action.args 
      && action.args.length === 2)
  {
    if (tree.root == null) {
      clearTree();
      animate();
    }
    else {
      const treeHeight = Tree.getHeight(action.args[1].root);
      if (treeHeight < Global.simulationData.treeHeight || action.args[0]) {
        formatDeleteData(action.args[1]);
        drawTree(action.args[1], settings, 'RESIZE');
      }
      else {
        refreshScreen(action.args[1]);
        if (getTreeType(tree) === 'Bst') {
          animate();
        }
        else {
          enableNext();
        }
      }
    }
  }
  else if (Tree.getHeight(Global.tree.root) 
      > Global.simulationData.treeHeight) 
  {
    Global.simulationData.treeHeight ++;
    drawTree(tree, settings, 'RESIZE');
  }
  else {
    animate();
  }
}

 /** User Input Functions */

/**
 * User input to select a new kind of tree
 * @param {string} selectInput Name of tree selected
 */
function treeChange(selectInput) {
  Global.currentTreeType = parseInt(selectInput.value);
}

/**
 * User input to create a tree with a certain number of nodes
 */
function createClick() {
  const numNodes = getInput('create');
  const minNodes = 1;
  const maxNodes = 200;
  if (numNodes === null) {
    return;
  }
  else if (numNodes > maxNodes || numNodes < minNodes) {
    setValidatorText('create-validation',
        `Please enter a number between ${minNodes} and ${maxNodes}.`);
    return;
  }

  disableInput();
  Global.tree = generateRandomTree(numNodes);
  setCreateAction();
  animate(Global.tree);
}

/**
 * User input to add a node with a certain value to the tree
 */
function addClick() {
  const nodeId = getInput('add');
  const minId = 0;
  const maxId = 2000;
  if (nodeId === null) {
    return;
  }
  else if (nodeId > maxId || nodeId < minId) {
    setValidatorText('add-validation',
        `Please enter a number between ${minId} and ${maxId}.`);
    return;
  }

  if (!Global.tree) {
    Global.tree = initializeTree();
    Global.tree.insert(nodeId);
    setCreateAction();
  }
  else {
    if (Global.tree.find(nodeId) === 1) {
      setValidatorText('add-validation', 'Node already exists.');
      return;
    }
    Global.tree.insert(nodeId);
  }
  disableInput();
  animate(Global.tree);
}

/**
 * User input to delete a node from the tree with a certain value
 */
function deleteClick() {
  let nodeId = getInput('delete');
  if (nodeId === null) {
    return;
  }
  else if (Global.tree.find(nodeId) !== 1) {
    setValidatorText('delete-validation', 'Node does not exist.');
    return;
  }
  Global.tree.delete(nodeId);
  disableInput();
  animate(Global.tree);
}

/**
 * User input to clear the current tree
 */
function clearClick() {
  Global.caption.textContent = 'Tree cleared!';
  clearTree();
}

/**
 * User input to move on to the next animation in the sequence
 * @param {Element} button The next animation button
 */
function nextAnimationClick(button) {
  button.disabled = true;
  unblinkNodes();
  animate();
}

 /** Input/Animation helpers */

/**
 * Clears tree objects as well as the screen
 */
function clearTree() {
  Global.tree = null;
  refreshScreen(null);
  enableButtons(null);
}

/**
 * Decides which buttons to enable depending on current state of tree
 * @param {?(Bst|Avl|RedBlack)} tree
 */
function enableButtons(tree) {
  // Clear any remaining elements from last animation
  clearTreeAnimationProperties();

  document.querySelectorAll('.input').forEach(x => x.disabled = false);
  if (tree == null || tree.root == null) {
    document.getElementById('delete-button').disabled = true;
    document.getElementById('clear-input').disabled = true;
    Global.tree = null;
  }
  else {
    document.getElementById('create-button').disabled = true;
    Global.tree = tree;
  }
}

/**
 * Enables next animation function
 */
function enableNext() {
  document.getElementById('next').disabled = false;
}

/**
 * Parses given input and validates it
 * @param {string} inputType Input type that called this function
 * @returns {?number} The parsed input
 */
function getInput(inputType) {
  setValidatorText(inputType + '-validation', '');

  const input = parseInt(document.getElementById(inputType + '-input').value);
  if (Number.isNaN(input) || input == null) {
    setValidatorText(inputType + '-validation', 'Invalid input.');
    return null;
  }
  else {
    return input;
  }
}

/**
 * @param {number} numNodes Number of nodes in the tree
 * @returns The generated tree
 */
function generateRandomTree(numNodes){
  let arr = Array.from(Array(numNodes+1).keys());
  arr.shift();
  arr = arr.map(x => x * 5 + Math.round(Math.random()*4-2));

  // Shuffle array
  for (let i = 0; i < arr.length; i ++) {
    const randNum = Math.round(Math.random()*(numNodes-1));
    const temp = arr[randNum];

    arr[randNum] = arr[i];
    arr[i] = temp;
  }

  const newTree = initializeTree();

  arr.forEach((i) => {
    newTree.insert(i);
  });

  return newTree;
}

/**
 * @param {?(Bst|Avl|RedBlack)=} tree Tree to get settings for
 * @returns {Object} Object specifying certain animation styles for the tree
 */
function getSettings(tree = Global.tree) {
  if (tree == null) {
    return null;
  }
  return {
    fillColour : tree.constructor.fill,
    textColour : tree.constructor.stroke,
    nodeSize : 15
  };
}

/**
 * Custom resize event ensures pixel coordinates in SVG are respected
 */
function resizeInterface() {
  if (Global.actionList.length != 0) {
    return;
  }

  Global.screenWidth = document.documentElement.clientWidth || window.innerWidth*0.9;
  Global.screenHeight = document.documentElement.clientHeight || window.innerHeight*0.9;

  Global.inputCell.style.height = Global.screenHeight - 10 + 'px';
  Global.inputCell.style.width = Global.screenWidth*0.25 + 'px';

  // May have hit minimum height of left cell
  if (Global.inputCell.offsetHeight > Global.screenHeight) {
    Global.screenHeight = Global.inputCell.offsetHeight;
  }

  Global.frameWidth = Global.screenWidth*0.73 - 10;
  Global.frameHeight = Global.screenHeight - Global.caption.offsetHeight - 10;
  Global.width = Global.frameWidth - Global.margin*2;
  Global.height = Global.frameHeight - Global.margin*2;
  Global.area = Global.width*Global.height;

  const frameStyle = 'width:' + Global.frameWidth +'px;height:' + Global.frameHeight +'px; display:block';
  Global.frame.setAttribute('style',frameStyle);

  Global.svg.style('width', Global.frameWidth + 'px')
      .style('height', Global.height + Global.margin*2 + 'px');

  refreshScreen();
}

/**
 * @param {string} elementId Id of a validator (label element)
 * @param {string} text Message to display in the validator
 */
function setValidatorText(elementId, text) {
  let validator = document.getElementById(elementId);
  if (text === '') {
    validator.style.display = 'none';
  }
  else {
    validator.style.display = '';
    validator.innerHTML = text;
  }
}

/**
 * @param {string} caption Sets caption for the animations
 */
function setCaption(caption) {
  Global.caption.textContent = caption;
}

/**
 * Checks the currently selected tree type to intialize a new tree
 */
function initializeTree() {
  switch (Global.currentTreeType) {
    case 1:
      return new Bst();
    case 2:
      return new Avl();
    case 3:
      return new RedBlack();
  }
}

/**
 *  Disables all new tree animation inputs
 */
function disableInput() {
  document.querySelectorAll('.input').forEach(x => x.disabled = true);
}


/** Startup script */

/**
 * Initializes several global variables and sets up the animation frame
 */
function initializeInterface() {
  setValidatorText('create-validation', '');
  setValidatorText('add-validation', '');
  setValidatorText('delete-validation', '');

  Global.currentTreeType = 1;
  Global.actionList = [];
  Global.margin = 15;

  Global.caption = document.getElementById('caption');
  Global.frame = document.getElementById('frame');
  Global.inputCell = document.getElementById('input-table');
  Global.svg = d3.select('#frame')
    .append('svg');

  resizeInterface();

  window.addEventListener('resize', (event) => {
    resizeInterface();
  });
}

window.addEventListener('load', () => {
  initializeInterface();
});