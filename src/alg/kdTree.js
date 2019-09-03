/**
 * k-d Tree JavaScript - V 1.01
 *
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports === 'object') {
    factory(exports);
  } else {
    factory(root);
  }
})(this, function(exports) {
  function Node(obj, dimension, parent) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.dimension = dimension;
  }

  function kdTree(points, metric, dimensions) {
    const self = this;

    function buildTree(points, depth, parent) {
      const dim = depth % dimensions.length;
      let median;
      let node;

      if (points.length === 0) {
        return null;
      }
      if (points.length === 1) {
        return new Node(points[0], dim, parent);
      }

      points.sort(function(a, b) {
        return a[dimensions[dim]] - b[dimensions[dim]];
      });

      median = Math.floor(points.length / 2);
      node = new Node(points[median], dim, parent);
      node.left = buildTree(points.slice(0, median), depth + 1, node);
      node.right = buildTree(points.slice(median + 1), depth + 1, node);

      return node;
    }

    // Reloads a serialied tree
    function loadTree(data) {
      // Just need to restore the `parent` parameter
      self.root = data;

      function restoreParent(root) {
        if (root.left) {
          root.left.parent = root;
          restoreParent(root.left);
        }

        if (root.right) {
          root.right.parent = root;
          restoreParent(root.right);
        }
      }

      restoreParent(self.root);
    }

    // If points is not an array, assume we're loading a pre-built tree
    if (!Array.isArray(points)) loadTree(points, metric, dimensions);
    else this.root = buildTree(points, 0, null);

    // Convert to a JSON serializable structure; this just requires removing
    // the `parent` property
    this.toJSON = function(src) {
      if (!src) src = this.root;
      const dest = new Node(src.obj, src.dimension, null);
      if (src.left) dest.left = self.toJSON(src.left);
      if (src.right) dest.right = self.toJSON(src.right);
      return dest;
    };

    this.insert = function(point) {
      function innerSearch(node, parent) {
        if (node === null) {
          return parent;
        }

        const dimension = dimensions[node.dimension];
        if (point[dimension] < node.obj[dimension]) {
          return innerSearch(node.left, node);
        }
        return innerSearch(node.right, node);
      }

      const insertPosition = innerSearch(this.root, null);
      let newNode;
      let dimension;

      if (insertPosition === null) {
        this.root = new Node(point, 0, null);
        return;
      }

      newNode = new Node(point, (insertPosition.dimension + 1) % dimensions.length, insertPosition);
      dimension = dimensions[insertPosition.dimension];

      if (point[dimension] < insertPosition.obj[dimension]) {
        insertPosition.left = newNode;
      } else {
        insertPosition.right = newNode;
      }
    };

    this.remove = function(point) {
      let node;

      function nodeSearch(node) {
        if (node === null) {
          return null;
        }

        if (node.obj === point) {
          return node;
        }

        const dimension = dimensions[node.dimension];

        if (point[dimension] < node.obj[dimension]) {
          return nodeSearch(node.left, node);
        }
        return nodeSearch(node.right, node);
      }

      function removeNode(node) {
        let nextNode;
        let nextObj;
        let pDimension;

        function findMin(node, dim) {
          let dimension;
          let own;
          let left;
          let right;
          let min;

          if (node === null) {
            return null;
          }

          dimension = dimensions[dim];

          if (node.dimension === dim) {
            if (node.left !== null) {
              return findMin(node.left, dim);
            }
            return node;
          }

          own = node.obj[dimension];
          left = findMin(node.left, dim);
          right = findMin(node.right, dim);
          min = node;

          if (left !== null && left.obj[dimension] < own) {
            min = left;
          }
          if (right !== null && right.obj[dimension] < min.obj[dimension]) {
            min = right;
          }
          return min;
        }

        if (node.left === null && node.right === null) {
          if (node.parent === null) {
            self.root = null;
            return;
          }

          pDimension = dimensions[node.parent.dimension];

          if (node.obj[pDimension] < node.parent.obj[pDimension]) {
            node.parent.left = null;
          } else {
            node.parent.right = null;
          }
          return;
        }

        // If the right subtree is not empty, swap with the minimum element on the
        // node's dimension. If it is empty, we swap the left and right subtrees and
        // do the same.
        if (node.right !== null) {
          nextNode = findMin(node.right, node.dimension);
          nextObj = nextNode.obj;
          removeNode(nextNode);
          node.obj = nextObj;
        } else {
          nextNode = findMin(node.left, node.dimension);
          nextObj = nextNode.obj;
          removeNode(nextNode);
          node.right = node.left;
          node.left = null;
          node.obj = nextObj;
        }
      }

      node = nodeSearch(self.root);

      if (node === null) {
        return;
      }

      removeNode(node);
    };

    this.nearest = function(point, maxNodes, maxDistance) {
      let i;
      let result;
      let bestNodes;

      bestNodes = new BinaryHeap(function(e) {
        return -e[1];
      });

      function nearestSearch(node) {
        let bestChild;
        const dimension = dimensions[node.dimension];
        const ownDistance = metric(point, node.obj);
        const linearPoint = {};
        let linearDistance;
        let otherChild;
        let i;

        function saveNode(node, distance) {
          bestNodes.push([node, distance]);
          if (bestNodes.size() > maxNodes) {
            bestNodes.pop();
          }
        }

        for (i = 0; i < dimensions.length; i += 1) {
          if (i === node.dimension) {
            linearPoint[dimensions[i]] = point[dimensions[i]];
          } else {
            linearPoint[dimensions[i]] = node.obj[dimensions[i]];
          }
        }

        linearDistance = metric(linearPoint, node.obj);

        if (node.right === null && node.left === null) {
          if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
            saveNode(node, ownDistance);
          }
          return;
        }

        if (node.right === null) {
          bestChild = node.left;
        } else if (node.left === null) {
          bestChild = node.right;
        } else if (point[dimension] < node.obj[dimension]) {
          bestChild = node.left;
        } else {
          bestChild = node.right;
        }

        nearestSearch(bestChild);

        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }

        if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
          if (bestChild === node.left) {
            otherChild = node.right;
          } else {
            otherChild = node.left;
          }
          if (otherChild !== null) {
            nearestSearch(otherChild);
          }
        }
      }

      if (maxDistance) {
        for (i = 0; i < maxNodes; i += 1) {
          bestNodes.push([null, maxDistance]);
        }
      }

      if (self.root) nearestSearch(self.root);

      result = [];

      for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
        if (bestNodes.content[i][0]) {
          result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
        }
      }
      return result;
    };

    this.balanceFactor = function() {
      function height(node) {
        if (node === null) {
          return 0;
        }
        return Math.max(height(node.left), height(node.right)) + 1;
      }

      function count(node) {
        if (node === null) {
          return 0;
        }
        return count(node.left) + count(node.right) + 1;
      }

      return height(self.root) / (Math.log(count(self.root)) / Math.log(2));
    };
  }

  // Binary heap implementation from:
  // http://eloquentjavascript.net/appendix2.html

  function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push(element) {
      // Add the new element to the end of the array.
      this.content.push(element);
      // Allow it to bubble up.
      this.bubbleUp(this.content.length - 1);
    },

    pop() {
      // Store the first element so we can return it later.
      const result = this.content[0];
      // Get the element at the end of the array.
      const end = this.content.pop();
      // If there are any elements left, put the end element at the
      // start, and let it sink down.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.sinkDown(0);
      }
      return result;
    },

    peek() {
      return this.content[0];
    },

    remove(node) {
      const len = this.content.length;
      // To remove a value, we must search through the array to find
      // it.
      for (let i = 0; i < len; i++) {
        if (this.content[i] == node) {
          // When it is found, the process seen in 'pop' is repeated
          // to fill up the hole.
          const end = this.content.pop();
          if (i != len - 1) {
            this.content[i] = end;
            if (this.scoreFunction(end) < this.scoreFunction(node)) this.bubbleUp(i);
            else this.sinkDown(i);
          }
          return;
        }
      }
      throw new Error('Node not found.');
    },

    size() {
      return this.content.length;
    },

    bubbleUp(n) {
      // Fetch the element that has to be moved.
      const element = this.content[n];
      // When at 0, an element can not go up any further.
      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        const parentN = Math.floor((n + 1) / 2) - 1;
        const parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        }
        // Found a parent that is less, no need to move it further.
        else {
          break;
        }
      }
    },

    sinkDown(n) {
      // Look up the target element and its score.
      const length = this.content.length;
      const element = this.content[n];
      const elemScore = this.scoreFunction(element);

      while (true) {
        // Compute the indices of the child elements.
        const child2N = (n + 1) * 2;
        const child1N = child2N - 1;
        // This is used to store the new position of the element,
        // if any.
        let swap = null;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          const child1 = this.content[child1N];
          var child1Score = this.scoreFunction(child1);
          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore) swap = child1N;
        }
        // Do the same checks for the other child.
        if (child2N < length) {
          const child2 = this.content[child2N];
          const child2Score = this.scoreFunction(child2);
          if (child2Score < (swap == null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap != null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        // Otherwise, we are done.
        else {
          break;
        }
      }
    }
  };

  exports.kdTree = kdTree;
  exports.BinaryHeap = BinaryHeap;
});
