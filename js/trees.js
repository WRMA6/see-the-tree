/**
 * @fileoverview Contains implementation of tree algorithms, responsible for
 * generating the list of Action objects used for animations
 * Avl/Red-Black tree algorithm reference: https://www.programiz.com/dsa
 */

/**
 * Represents a Bst node
 */
class BstNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/**
 * Represents an Avl tree node
 */
class AvlNode extends BstNode {
  /**
  * @param {number} value Value of BstNode
  */
  constructor(value) {
    super(value);
    this.height = 1;
  }
}

/**
 * Represents a Red-Black tree node
 */
class RbNode extends BstNode {
  /**
  * @param {number} value Value of BstNode
  */
  constructor(value) {
    super(value);
    this.parent = null;
    this.colour = 1;

    // RB nodes can have multiple colours, cannot just be specified in class
    this.fills = ['#dedede', '#ffb5b5'];
    this.strokes = ['#404040', '#ff4040'];
  }
}

/**
 * Class used to generate required animation steps
 */
class Action {
  /**
  * @param {number} id Id corresponding to the action
  * @param {?Array<*>} args Any arguments that might be required
  */
  constructor(id, args) {
    this.id = id;
    this.args = args;
  }
}

/**
 * Represents a binary tree
 * @abstract
 */
class Tree {
  static highlightFill = '#ffff80';
  static highlightStroke = '#ffc61a';

  constructor() {
    if (this.constructor == Tree) {
      throw new Error('Abstract class tree cannot be instantiated');
    }
    else {
      this.root = null;
    }
  }

  /**
  * @param {BstNode} node Bst subtree
  * @return {number} Minimum value in binary subtree
  */
  static getMinValue(node) {
    let min = node.value;
    pushAction(9, [min]);

    while (node.left !== null) {
      min = node.left.value;
      pushAction(9, [min]);
      node = node.left;
    }

    return min;
  }

  /**
  * @param {BstNode} node Tree node
  * @param {number} value Value to search for
  * @return {boolean} Whether the value was found
  */
  static findRecursive(node, value) {
    if (node === null) {
      return -1;
    }
    else if (value < node.value) {
      return this.findRecursive(node.left, value);
    }
    else if (value > node.value) {
      return this.findRecursive(node.right, value);
    }
    else {
      return 1;
    }
  }

  /**
  * @param {BstNode} node Tree node
  * @return {number} Height of the node
  */
  static getHeight(node) {
    if (node === null) {
      return 0;
    }
    else {
      const leftHeight = Tree.getHeight(node.left);
      const rightHeight = Tree.getHeight(node.right);
      return Math.max(leftHeight, rightHeight) + 1;
    }
  }

  /**
  * @param {BstNode} node Tree node class
  */
  static inOrderPrintRecursive(node) {
    if (node == null) {
        return;
    }

    if (node.left !== null) {
      this.inOrderPrintRecursive(node.left);
    }

    console.log(node.value);

    if (node.right !== null) {
      this.inOrderPrintRecursive(node.right);
    }
  }
}

/** In order print of this tree */
Tree.prototype.inOrderPrint = function () {
  Tree.inOrderPrintRecursive(this.root);
}

/** 
 * Find node in this tree 
 * @param {number} value Value to find
 * @return {boolean} Whether value was found
 */
Tree.prototype.find = function (value) {
  return Bst.findRecursive(this.root, value);
}

/**
 * Binary Search Tree Class
 */
class Bst extends Tree {
  static fill = '#99ebff';
  static stroke = '#0099ff';

  constructor() {
    super();
  }

  /**
  * @param {BstNode} node Tree node
  * @param {number} value Value to insert
  */
  static insertRecursive(node, value) {
    if (value < node.value) {
      pushAction(3, [value, node.value]);
      if (node.left === null) {
        node.left = new BstNode(value);
        pushAction(1, [value, node.value]);
      }
      else {
        Bst.insertRecursive(node.left, value);
      }
    }
    else {
      pushAction(4, [value, node.value]);
      if (node.right === null) {
        node.right = new BstNode(value);
        pushAction(2, [value, node.value]);
      }
      else {
        Bst.insertRecursive(node.right, value);
      }
    }
  }

  /**
  * @param {BstNode} node Tree node
  * @param {number} value Value to delete
  * @return {BstNode} New node to go in the place of the node parameter
  */
  static deleteRecursive(node, value) {
    if (node != null) {
      if (value < node.value) {
        pushAction(3, [value, node.value]);
        node.left = Bst.deleteRecursive(node.left, value);
        pushDelete();
      } 
      else if (value > node.value) {
        pushAction(4, [value, node.value]);
        node.right = Bst.deleteRecursive(node.right, value);
        pushDelete();
      } 
      else if (node.left && node.right) {
        pushAction(6, [value]);
        let oldValue = node.value;
        node.value = Tree.getMinValue(node.right);

        pushAction(10, [oldValue, node.value]);
        node.right = Bst.deleteRecursive(node.right, node.value);
        pushDelete();
      } 
      else {
        const oldValue = node.value;
        pushAction(11, [oldValue]);
        node = node.left || node.right;

        let resizeRequired = false;
        if (node === null) {
          pushAction(8, [oldValue]);
        }
        else {
          resizeRequired = true;
          pushAction(7, [oldValue]);
        }

        // Need copy of tree after function call has returned
        // This is done by the pushDelete function
        Global.deleteSpec = [resizeRequired];
      }
      return node;
    }
    else {
      return null;
    }
  }
}

/**
 * @param {number} value Value to insert into this tree
 */
Bst.prototype.insert = function (value) {
  Global.operation = 'INSERT';

  if (this.root === null) {
    this.root = new BstNode(value);
    Global.actionList = [new Action(0, null)];
  }
  else {
    Bst.insertRecursive(this.root, value);
  }

  pushActionEnd('Insertion complete.');
  Global.actionList = Global.actionList.reverse();
  pushAction(5, null);
}

/**
 * @param {number} value Value to delete from this tree
 */
Bst.prototype.delete = function (value) {
  Global.operation = 'DELETE';
  
  this.root = Bst.deleteRecursive(this.root, value);
  pushDelete();

  pushActionEnd('Deletion complete.');
  Global.actionList = Global.actionList.reverse();
}

/**
 * Avl Tree Class
 */
class Avl extends Tree {
  static fill = '#91ff9f';
  static stroke = '#53b05f';

  constructor() {
    super();
  }

  /** @override */
  static getHeight(node) {
    if (node === null) {
      return 0;
    }

    return node.height;
  }

  /**
  * @param {AvlNode} node Node to get balance of
  * @return {number} Balance of node
  */
  static getBalance(node) {
    return Avl.getHeight(node.left) - Avl.getHeight(node.right);
  }

  /**
  * @param {AvlNode} leftNode Node to rotate around
  * @return {AvlNode} New node to go in the place of leftNode
  */
  static leftRotate(leftNode) {
    const rightNode = leftNode.right;
    const subtree = rightNode.left;

    rightNode.left = leftNode;
    leftNode.right = subtree;

    leftNode.height = Math.max(Avl.getHeight(leftNode.left),
      Avl.getHeight(leftNode.right)) + 1;
    rightNode.height = Math.max(Avl.getHeight(rightNode.left),
      Avl.getHeight(rightNode.right)) + 1;

    let subtreeValue = null;
    if (subtree !== null) {
      subtreeValue = subtree.value;
    }

    // Need copy of tree after function call returns
    // This is done by pushDeleteAndRotate function
    Global.rotationSpec = [leftNode.value, rightNode.value, subtreeValue, 15];

    return rightNode;
  }

  /**
  * @param {AvlNode} rightNode Node to rotate around
  * @return {AvlNode} New node to go in the place of rightNode
  */
  static rightRotate(rightNode) {
    const leftNode = rightNode.left;
    const subtree = leftNode.right;

    leftNode.right = rightNode;
    rightNode.left = subtree;

    rightNode.height = Math.max(Avl.getHeight(rightNode.left),
      Avl.getHeight(rightNode.right)) + 1;
    leftNode.height = Math.max(Avl.getHeight(leftNode.left),
      Avl.getHeight(leftNode.right)) + 1;

    let subtreeValue = null;
    if (subtree !== null) {
      subtreeValue = subtree.value;
    }

    // Need copy of tree after function call returns
    // This is done by pushDeleteAndRotate function
    Global.rotationSpec = [rightNode.value, leftNode.value, subtreeValue, 14];

    return leftNode;
  }

  /**
  * @param {AvlNode} node Avl tree node
  * @param {number} value Value to insert
  * @return {AvlNode} New node to go in the place of the node parameter
  */
  static insertRecursive(node, value) {
    if (value < node.value) {
      if (node.left === null) {
        node.left = new AvlNode(value);
        checkInsertResize();
        pushAction(3, [value, node.value]);
        pushAction(1, [value, node.value]);
      }
      else {
        pushAction(3, [value, node.value]);
        node.left = Avl.insertRecursive(node.left, value);
        pushDeleteAndRotate(node.value);
      }
    }
    else {
      if (node.right === null) {
        node.right = new AvlNode(value);
        checkInsertResize();
        pushAction(4, [value, node.value]);
        pushAction(2, [value, node.value]);
      }
      else {
        pushAction(4, [value, node.value]);
        node.right = Avl.insertRecursive(node.right, value);
        pushDeleteAndRotate(node.value);
      }
    }

    node.height = Math.max(Avl.getHeight(node.left),
      Avl.getHeight(node.right)) + 1;

    const balance = Avl.getBalance(node);

    if (balance > 1) {
      pushAction(13, [node.value]);
      if (value < node.left.value) {
        return Avl.rightRotate(node);
      }
      else {
        node.left = Avl.leftRotate(node.left);
        pushDeleteAndRotate(node.value);
        return Avl.rightRotate(node);
      }
    }

    if (balance < -1) {
      pushAction(13, [node.value]);
      if (value > node.right.value) {
        return Avl.leftRotate(node);
      }
      else {
        node.right = Avl.rightRotate(node.right);
        pushDeleteAndRotate(node.value);
        return Avl.leftRotate(node);
      }
    }

    pushAction(12, [node.value]);

    return node;
  }

  /**
  * @param {AvlNode} node Avl tree node
  * @param {number} value Value to delete
  * @return {AvlNode} New node to go in the place of the node parameter
  */
  static deleteRecursive(node, value) {
    if (node != null) {
      if (value < node.value) {
        pushAction(3, [value, node.value]);
        node.left = Avl.deleteRecursive(node.left, value);
        pushDeleteAndRotate(node.value);
      } 
      else if (value > node.value) {
        pushAction(4, [value, node.value]);
        node.right = Avl.deleteRecursive(node.right, value);
        pushDeleteAndRotate(node.value);
      } 
      else if (node.left && node.right) {
        const oldValue = node.value;
        pushAction(6, [value]);
        node.value = Tree.getMinValue(node.right);

        pushAction(10, [oldValue, node.value]);
        node.right = Avl.deleteRecursive(node.right, node.value);
        pushDeleteAndRotate(node.value);
      } 
      else {
        const oldValue = node.value;
        pushAction(11, [oldValue]);
        node = node.left || node.right;

        if (node === null) {
          pushAction(8, [oldValue]);
          Global.deleteSpec = [false];
        }
        else {
          pushAction(7, [oldValue]);
          Global.deleteSpec = [true];
        }

        return node;
      }

      node.height = Math.max(Avl.getHeight(node.left),
        Avl.getHeight(node.right)) + 1;

      const balance = Avl.getBalance(node);

      if (balance > 1) {
        pushAction(13, [node.value]);
        if (Avl.getBalance(node.left) >= 0) {
          return Avl.rightRotate(node);
        }
        else {
          node.left = Avl.leftRotate(node.left);
          pushDeleteAndRotate(node.value);
          return Avl.rightRotate(node);
        }
      }

      if (balance < -1) {
        pushAction(13, [node.value]);
        if (Avl.getBalance(node.right) <= 0) {
          return Avl.leftRotate(node);
        }
        else {
          node.right = Avl.rightRotate(node.right);
          pushDeleteAndRotate(node.value);
          return Avl.leftRotate(node);
        }
      }

      pushAction(12, [node.value]);

      return node;

    }
    else {
      return null;
    }
  }
}

/**
 * @param {number} value Value to insert into this tree
 */
Avl.prototype.insert = function (value) {
  Global.operation = 'INSERT';

  if (this.root === null) {
    this.root = new AvlNode(value);
    Global.actionList = [new Action(0, null)];
  }
  else {
    this.root = Avl.insertRecursive(this.root, value);
    pushDeleteAndRotate(null);
  }

  pushActionEnd('Insertion complete, tree is balanced.');
  Global.actionList = Global.actionList.reverse();
  pushAction(5, null);
}

/**
 * @param {number} value Value to delete from this tree
 */
Avl.prototype.delete = function (value) {
  Global.operation = 'DELETE';

  this.root = Avl.deleteRecursive(this.root, value);
  pushDeleteAndRotate(null);

  pushActionEnd('Deletion complete, tree is balanced.');
  Global.actionList = Global.actionList.reverse();
}

/**
 * Red-Black Tree Class
 */
class RedBlack extends Tree {
  // Red is default insert colour
  static fill = '#ffb5b5';
  static stroke = '#ff4040';

  constructor() {
    super();
  }

  /**
  * @param {RbNode} leftNode Node to rotate around
  * @param {RedBlack} tree Tree in which node is being rotated
  */
  static leftRotate(leftNode, tree) {
    const rightNode = leftNode.right;
    leftNode.right = rightNode.left;

    // For animations
    let parentValue = null;
    if (leftNode.parent !== null) {
      parentValue = leftNode.parent.value;
    }
    let subtreeValue = null;
    if (rightNode.left !== null) {
      subtreeValue = rightNode.left.value;
    }

    if (leftNode.right !== null) {
      leftNode.right.parent = leftNode;
    }

    rightNode.parent = leftNode.parent;

    if (leftNode.parent === null) {
      tree.root = rightNode;
    }
    else if (leftNode === leftNode.parent.left) {
      leftNode.parent.left = rightNode;
    }
    else {
      leftNode.parent.right = rightNode;
    }

    rightNode.left = leftNode;
    leftNode.parent = rightNode;

    pushAction(
        15, 
        [
            leftNode.value, 
            rightNode.value, 
            subtreeValue, 
            parentValue, 
            getTreeCopy(tree),
        ],
    );
  }

  /**
  * @param {RbNode} rightNode Node to rotate around
  * @param {RedBlack} tree Tree in which node is being rotated
  */
  static rightRotate(rightNode, tree) {
    const leftNode = rightNode.left;
    rightNode.left = leftNode.right;

    // For animations
    let parentValue = null;
    if (rightNode.parent !== null) {
      parentValue = rightNode.parent.value;
    }
    let subtreeValue = null;
    if (leftNode.right !== null) {
      subtreeValue = leftNode.right.value;
    }

    if (rightNode.left !== null) {
      rightNode.left.parent = rightNode;
    }

    leftNode.parent = rightNode.parent;

    if (rightNode.parent === null) {
      tree.root = leftNode;
    }
    else if (rightNode === rightNode.parent.right) {
      rightNode.parent.right = leftNode;
    }
    else {
      rightNode.parent.left = leftNode;
    }

    leftNode.right = rightNode;
    rightNode.parent = leftNode;

    pushAction(
        14, 
        [
            rightNode.value, 
            leftNode.value, 
            subtreeValue, 
            parentValue, 
            getTreeCopy(tree),
        ],
    );
  }

  /**
  * @param {RbNode} node Red-Black tree node
  * @param {number} value Value to insert
  * @return {RbNode} New node that was inserted
  */
  static insertRecursive(node, value) {
    if (value < node.value) {
      pushAction(3, [value, node.value]);

      if (node.left === null) {
        const newNode = new RbNode(value);
        newNode.parent = node;
        node.left = newNode;
        checkInsertResize();
        pushAction(1, [value, node.value]);
        return newNode;
      }
      else {
        return RedBlack.insertRecursive(node.left, value);
      }
    }
    else {
      pushAction(4, [value, node.value]);

      if (node.right === null) {
        const newNode = new RbNode(value);
        newNode.parent = node;
        node.right = newNode;
        checkInsertResize();
        pushAction(2, [value, node.value]);
        return newNode;
      }
      else {
        return RedBlack.insertRecursive(node.right, value);
      }
    }
  }

  /**
  * @param {RbNode} newNode Node that was just inserted
  * @param {RedBlack} tree Tree in to fix violations
  */
  static fixInsert(newNode, tree) {
    let child = newNode;
    let uncle = null;
    let nextNodeDescription = '';

    if (child.parent === null) {
      pushAction(17, [child]);
      child.colour = 0;
      return;
    }
    else if (child.parent.parent === null) {
      pushAction(19, [child.value]);
      return;
    }

    while (child.parent.colour === 1) {
      const grandparent = child.parent.parent;

      if (child.parent === grandparent.right) {
        uncle = grandparent.left;

        if (uncle !== null && uncle.colour === 1) {
          child.parent.colour = 0;
          uncle.colour = 0;
          grandparent.colour = 1;
          pushAction(20, [[child.parent, 0], [uncle, 0], [grandparent, 1]]);

          child = grandparent;
          nextNodeDescription = 'was previously the grandparent';
        }
        else {
          nextNodeDescription = 'same node as before';

          if (child === child.parent.left) {
            child = child.parent;
            nextNodeDescription = 'was previously the parent';
            RedBlack.rightRotate(child, tree);
          }

          child.parent.colour = 0;
          grandparent.colour = 1;

          if (grandparent === child.parent) {
            pushAction(21, [[grandparent, 1]]);
          }
          else {
            pushAction(22, [[child.parent, 0], [grandparent, 1]]);
          }

          RedBlack.leftRotate(grandparent, tree);
        }
      } else {
        uncle = grandparent.right;

        if (uncle !== null && uncle.colour === 1) {
          child.parent.colour = 0;
          uncle.colour = 0;
          grandparent.colour = 1;
          pushAction(20, [[child.parent, 0], [uncle, 0], [grandparent, 1]]);

          child = grandparent;
          nextNodeDescription = 'was previously the grandparent';
        }
        else {
          nextNodeDescription = 'same node as before';

          if (child === child.parent.right) {
            child = child.parent;
            nextNodeDescription = 'was previously the parent';
            RedBlack.leftRotate(child, tree);
          }

          child.parent.colour = 0;
          grandparent.colour = 1;

          if (grandparent === child.parent) {
            pushAction(21, [[grandparent, 1]]);
          }
          else {
            pushAction(22, [[child.parent, 0], [grandparent, 1]]);
          }

          RedBlack.rightRotate(grandparent, tree);
        }
      }
      pushAction(23, [child.value, nextNodeDescription]);
      if (child === tree.root) {
        pushAction(17, [child]);
        break;
      }
    }

    if (child.parent !== null && child.parent.colour === 0) {
      if (tree.root.colour === 1) {
        pushAction(18, [child.value, tree.root]);
      }
      else {
        pushAction(19, [child.value]);
      }
    }
    tree.root.colour = 0;
  }

  /**
  * @param {RbNode} node Red-Black tree node
  * @param {number} value Value to delete
  * @param {RedBlack} tree Tree in which node is beig deleted
  */
  static deleteRecursive(node, value, tree) {
    if (value < node.value) {
      pushAction(3, [value, node.value]);
      RedBlack.deleteRecursive(node.left, value, tree);
    }
    else if (value > node.value) {
      pushAction(4, [value, node.value]);
      RedBlack.deleteRecursive(node.right, value, tree);
    }
    else if (node.left && node.right) {
      const oldValue = node.value;
      pushAction(6, [value]);
      node.value = Tree.getMinValue(node.right);

      pushAction(10, [oldValue, node.value]);
      RedBlack.deleteRecursive(node.right, node.value, tree);
    }
    else {
      let resizeRequired = false;
      pushAction(11, [node.value]);
      const successor = node.left || node.right;

      if (successor === null) {
        pushAction(8, [node.value]);
        if (node.parent === null) {
          pushAction(5, [null, null]);
          tree.root = null;
          return;
        }
      }
      else {
        resizeRequired = true;
        pushAction(7, [node.value]);
      }

      // Ensure parent/child references are correct after deletion
      if (node.parent === null) {
        tree.root = successor;
      }
      else {
        if (node === node.parent.left) {
          node.parent.left = successor;
        }
        else {
          node.parent.right = successor;
        }
      }

      if (successor !== null) {
        successor.parent = node.parent;
      }

      pushAction(5, [resizeRequired, getTreeCopy()]);

      if (node.colour === 0 && (successor === null || successor.colour === 0)) {
        // Double black violation
        if (successor === null) {
          if (node.parent !== null) {
            pushAction(24, [node.value, ` (null child of Node ${node.parent.value})`]);
          }
          else {
            pushAction(24, [node.value, ' (former tree root)']);
          }
          RedBlack.deleteFix(node.parent, null, tree);
        }
        else {
          pushAction(16, [successor.value]);
          RedBlack.deleteFix(node.parent, node, tree);
        }
      }
      else {
        if (successor !== null && successor.colour === 1) {
          pushAction(25, [[successor, 0]]);
          successor.colour = 0;
        }
        else {
          pushAction(26, null);
        }
      }
    }
  }

  /**
  * @param {RbNode} parent Parent node of the node that was deleted
  * @param {?RbNode} node New node in the place of the one that was deleted
  * @param {RedBlack} tree Tree in which violations need to be fixed
  */
  static deleteFix(parent, node, tree) {
    let sibling = null;
    while (node !== tree.root && isBlack(node)) {
      if (parent.left === null || parent.left === node) {
        sibling = parent.right;
        
        if (sibling.colour == 1) {
          sibling.colour = 0;
          parent.colour = 1;
          pushAction(27, [[parent, 1], [sibling, 0]]);

          RedBlack.leftRotate(parent, tree);
          sibling = parent.right;
        }

        if (isBlack(sibling.left) && isBlack(sibling.right)) {
          sibling.colour = 1;
          pushAction(28, [[sibling, 1]]);
          node = parent;
          parent = node.parent;
          pushAction(23, [node.value, 'was previously the parent']);
        } 
        else {
          if (isBlack(sibling.right)) {
            if (!isBlack(sibling.left)) {
              sibling.left.colour = 0;
              pushAction(30, [[sibling, 1], [sibling.left, 0]]);
            }
            else {
              pushAction(28, [[sibling, 1]]);
            }
            sibling.colour = 1;

            RedBlack.rightRotate(sibling, tree);
            sibling = parent.right;
          }

          sibling.colour = parent.colour;
          parent.colour = 0;
          if (!isBlack(sibling.right)) {
            sibling.right.colour = 0;
            pushAction(
                31, 
                [
                    [sibling, sibling.colour], 
                    [parent, 0], 
                    [sibling.right, 0], 
                    ', its right child to black,',
                ],
            );
          }
          else {
            pushAction(31, [[sibling, sibling.colour], [parent, 0], '']);
          }

          RedBlack.leftRotate(parent, tree);
          node = tree.root;
        }
      } 
      else {
        sibling = parent.left;

        if (sibling.colour === 1) {
          sibling.colour = 0;
          parent.colour = 1;
          pushAction(27, [[parent, 1], [sibling, 0]]);

          RedBlack.rightRotate(parent, tree);
          sibling = parent.left;
        }

        if (isBlack(sibling.left) && isBlack(sibling.right)) {
          sibling.colour = 1;
          pushAction(28, [[sibling, 1]]);
          node = parent;
          parent = node.parent;
          pushAction(23, [node.value, 'was previously the parent']);
        } 
        else {
          if (isBlack(sibling.left)) {
            if (!isBlack(sibling.right)) {
              sibling.right.colour = 0;
              pushAction(30, [[sibling, 1], [sibling.right, 0]]);
            }
            else {
              pushAction(28, [[sibling, 1]]);
            }
            sibling.colour = 1;
            
            RedBlack.leftRotate(sibling, tree);
            sibling = parent.left;
          }

          sibling.colour = parent.colour;
          parent.colour = 0;
          if (!isBlack(sibling.left)) {
            sibling.left.colour = 0;
            pushAction(
                31, 
                [
                    [sibling, sibling.colour], 
                    [parent, 0], 
                    [sibling.left, 0], 
                    ', its left child to black,',
                ],
            );
          }
          else {
            pushAction(31, [[sibling, sibling.colour], [parent, 0], '']);
          }

          RedBlack.rightRotate(parent, tree);
          node = tree.root;
        }
      }
    }

    if (!isBlack(tree.root)) {
      pushAction(29, [[tree.root, 0], '(root) ']);
      tree.root.colour = 0;
    }
    else if (!isBlack(node)) {
      pushAction(29, [[node, 0], '']);
      node.colour = 0;
    }
  }
}

/**
 * @param {number} value Value to insert into this tree
 */
RedBlack.prototype.insert = function (value) {
  Global.operation = 'INSERT';

  if (this.root === null) {
    this.root = new RbNode(value);
    this.root.colour = 0;
    Global.actionList = [new Action(0, null)];
  }
  else {
    const newNode = RedBlack.insertRecursive(this.root, value);
    pushAction(16, [newNode.value]);
    RedBlack.fixInsert(newNode, this);
  }

  pushActionEnd('Insertion complete, tree is balanced.');
  Global.actionList = Global.actionList.reverse();
  pushAction(5, null);
}

/**
 * @param {number} value Value to delete from this tree
 */
RedBlack.prototype.delete = function (value) {
  Global.operation = 'DELETE';

  RedBlack.deleteRecursive(this.root, value, this);
  pushActionEnd('Deletion complete, tree is balanced.');
  Global.actionList = Global.actionList.reverse();
}

/** Helpers */

/**
 * Pushes resize action with the height of the tree currently
 */
function checkInsertResize() {
  if (Global.tree != null && Global.tree.root !== null) {
    Global.actionList.unshift(
        new Action(5, [Tree.getHeight(Global.tree.root)])
    );
  }
}

/**
 * @param {(Bst|Avl|RedBlack)=} tree Tree to get copy of
 */
function getTreeCopy(tree = null) {
  if (tree == null) {
    tree = Global.tree;
  }

  if (tree == null) {
    return null;
  }
  else {
    return JSON.parse(JSON.stringify(tree, (key, value) => {
      // Avoid circular structure in copy, which is not needed
      if (key == 'parent') {
        return null;
      }
      return value;
    }));
  }
}

/**
 * @param {(Bst|Avl|RedBlack)=} tree Tree to get name of
 */
function getTreeName(tree = null) {
  if (tree == null) {
    tree = Global.tree;
  }

  if (tree == null) {
    return '';
  }

  switch (tree.constructor.name) {
    case 'Bst':
      return 'BST';
    case 'Avl':
      return 'AVL Tree';
    case 'RedBlack':
      return 'Red-Black Tree';
    default:
      break;
  }
}

/**
 * @param {(Bst|Avl|RedBlack)=} tree Tree to get type of
 */
function getTreeType(tree = null) {
  if (tree == null) {
    tree = Global.tree;
  }

  if (tree == null) {
    return '';
  }

  return tree.constructor.name;
}

/**
 * @param {RbNode} node Red-Black node to check colour of
 */
function isBlack(node) {
  return node === null || node.colour === 0;
}

/**
 * @param {number} actionId Id of the action
 * @param {?Array<*>} args Arguments required for the animation of the action
 */
function pushAction(actionId, args) {
  Global.actionList.push(new Action(actionId, args));
}

/**
 * Adds the end of animation sequence action with a given message
 * @param {string} message Id of the action
 */
function pushActionEnd(message) {
  Global.actionList.push(new Action(32, [message]));
}

/**
 * Adds delete animation if required, used to ensure right copy of tree
 */
function pushDelete() {
  if (Global.deleteSpec == null) {
    return;
  }

  const args = Global.deleteSpec;

  args.push(getTreeCopy());

  pushAction(5, args);

  Global.deleteSpec = null;
}

/**
 * Adds delete/rotate animation if required, used to ensure right copy of tree
 * @param {?number} parentId Parent of node being rotated around
 */
function pushDeleteAndRotate(parentId) {
  if (Global.deleteSpec != null) {
    pushDelete();
    return;
  }

  if (Global.rotationSpec == null) {
    return;
  }

  const args = Global.rotationSpec;
  const actionId = args.pop();

  args.push(parentId);
  args.push(getTreeCopy());

  pushAction(actionId, args);

  Global.rotationSpec = null;
}

/**
 * Sets the animation sequence to only the create tree animation
 */
function setCreateAction() {
  Global.actionList = [new Action(0, [])];
}