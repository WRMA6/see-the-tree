# Javascript Tree Algorithm Visualizer
This program was written using HTML/CSS/Javascript. It implements and animates insert/delete operations for Binary Search Trees, AVL Trees, and Red-Black Trees.

The user is able to input a node value that they would like to insert into or delete from the tree. After this input is validated, the program steps through the algorithm used to perform the given operation. Additionally, users are also able to insert many nodes at once by using the create tree input, which generates a tree with a given number of nodes. This provides an easy way to observe how the algorithms (usually recursively) deal with larger trees, without having to insert nodes one by one. Users are also provided the ability to clear a tree completely from the screen, as well as choose what type of tree they want to see.

The animations rely heavily on the D3.js library, using both its wide variety of visualization tools and powerful selection functionality. Tree nodes and links are visualized on screen using force simulations, where each node and link exert and are subjected to forces that take them from initial to end position. This is most prominently shown in the create tree function, where the tree appears to swoop in from outside the screen and snap into place. Every other movement on screen, whether it be rotations, colour changes, or fade-in/out also leverage the capabilities of the D3 library.

The tree algorithms themselves are implemented in fairly standard fashion, similar to what might be found in many textbooks or websites. However, there is also extra logic inserted into them to generate actions, which contain information that is later passed on to the animation functions. Many of the changes to the tree algorithms' logic were made to accomodate this.

The demo below shows both the create tree and delete node animations for a Red-Black tree.

![](docs/demo.gif?raw=true "Screencap")