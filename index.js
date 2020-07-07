const nrRows = 31;
const nrNodesPerRow = 70;
const totalNodes = nrRows * nrNodesPerRow;

const { nodesMatrix, visited } = initGrid();

window.onload = function() {
    feather.replace()

    var adjList = createAdjList(nodesMatrix);

    let btnVisualize = document.getElementById("visualize");
    btnVisualize.onclick = async() => {
        var predictedPath = [];
        if (await BFSv2(adjList, predictedPath, nodesMatrix) == false) {
            console.log("There is no path");
        }
        let path = [];
        let start = 1110;
        path.push(start);
        while (predictedPath[start] != -1) {
            path.push(predictedPath[start]);
            start = predictedPath[start];
        }
        for (let i = path.length - 2; i > 0; i--) {
            nodesMatrix[Math.floor(path[i] / nrNodesPerRow)][path[i] % nrNodesPerRow].classList.add("path-node");
            await sleep(10);
        }
    }

    let btnRandomPattern = document.getElementById("random-pattern");
    btnRandomPattern.onclick = function() {
        clearPattern(nodesMatrix, visited);
        generateRandomPattern(nodesMatrix, visited)
    };

    let nodes = document.getElementsByClassName("node");

    const createBlockedNode = function(node) {
        if (!node.classList.contains("blocked-node")) {
            node.classList.add("blocked-node")
        } else {
            node.classList.remove("blocked-node");
        }
    }
    var mouseDown = false;
    window.addEventListener("mousedown", function() {
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].onmouseover = function(ev) {
                if (ev.buttons == 1) {
                    createBlockedNode(nodes[i])
                }
            };
        }
    });

    let drpAlgorithms = document.getElementById("drp-algorithms");
    let iconAlgorithms = document.getElementById("icon-algorithms");
    drpAlgorithms.onmouseenter = function() {
        iconAlgorithms.removeAttribute("data-feather");
        iconAlgorithms.setAttribute("data-feather", "chevron-up");
        feather.replace();
    }
    drpAlgorithms.onmouseleave = function() {
        iconAlgorithms.removeAttribute("data-feather");
        iconAlgorithms.setAttribute("data-feather", "chevron-down");
        feather.replace();
    }
    let btnDfs = document.getElementById("btn-dfs");
    btnDfs.onclick = function() {
        let adjList = createAdjList(nodesMatrix);
        var stack = initStack();
        DFS2(adjList);
        // DFSIterative(adjList)
    }

}

function initGrid() {
    let matrix = document.getElementById("matrix");
    var nodesMatrix = [],
        visited = [];
    for (let i = 0; i < nrRows; i++) {
        let row = matrix.insertRow(i);
        row.classList.add("node");
        nodesMatrix[i] = [];
        visited[i] = [];

        for (let j = 0; j < nrNodesPerRow; j++) {
            let node = row.insertCell(j);
            node.classList.add("node");
            nodesMatrix[i][j] = node;
            visited[i][j] = false;

            if (i == 15 && j == 10) {
                node.classList.add("start-node");
            } else if (i == 15 && j == 60) {
                node.classList.add("destination-node");
            }
        }
    }
    return { nodesMatrix: nodesMatrix, visited: visited };
}

function visualize(nodesMatrix) {
    for (let i = 0; i < nrRows; i++) {
        for (let j = 0; j < nrNodesPerRow; j++) {
            delayed(500, function(i, j) {
                return function() {
                    nodesMatrix[i][j].classList.add("visited-node");
                };
            }(i, j));
        }
    }
}

async function BFSv1(nodesMatrix) {
    let matrix = [];
    let k = 0;
    for (let i = 0; i < nrRows * nrNodesPerRow; i++) {
        matrix[i] = [];
        for (let j = 0; j < nrRows * nrNodesPerRow; j++) {
            matrix[i][j] = 0;
        }
    }
    for (let i = 0; i < nrRows; i++) {
        for (let j = 0; j < nrNodesPerRow; j++) {
            if (!nodesMatrix[i][j].classList.contains("blocked-node")) {
                if (i > 0 && !nodesMatrix[i - 1][j].classList.contains("blocked-node")) {
                    matrix[k - nrNodesPerRow][k] = 1;
                }
                if (j > 0 && !nodesMatrix[i][j - 1].classList.contains("blocked-node")) {
                    matrix[k][k - 1] = 1;
                }
                if (i < nrRows - 1 && !nodesMatrix[i + 1][j].classList.contains("blocked-node")) {
                    matrix[k + nrNodesPerRow][k] = 1;
                }
                if (j < nrNodesPerRow - 1 && !nodesMatrix[i][j + 1].classList.contains("blocked-node")) {
                    matrix[k][k + 1] = 1;
                }
            }
            k++;
        }
    }

    let visited = [];
    for (let i = 0; i < nrRows * nrNodesPerRow; i++) {
        visited[i] = false;
    }
    visited[150] = true;
    let queue = [];
    queue.push(15 * nrNodesPerRow + 10);
    while (Array.isArray(queue) && queue.length) {
        await sleep(10);
        if (nodesMatrix[Math.round(queue[0] / nrNodesPerRow)] == null) {
            console.log(queue);
        }
        nodesMatrix[Math.floor(queue[0] / nrNodesPerRow)][queue[0] % nrNodesPerRow].classList.add("visited-node");
        let x = queue.shift();
        let i = 0;
        for (; i < matrix.length; i++) {
            if (matrix[x][i] == 1 && visited[i] == false) {
                queue.push(i)
                visited[i] = true;
            }
        }
    }
}

async function BFSv2(adjList, shortestPath, nodesMatrix, startNode = 1060, endNode = 1110) {
    let queue = [],
        visited = [],
        distances = [];

    for (let i = 0; i < totalNodes; i++) {
        visited[i] = false;
        distances[i] = Number.MAX_VALUE;
        shortestPath[i] = -1;
    }

    visited[startNode] = true;
    distances[startNode] = 0;
    queue.push(startNode);
    nodesMatrix[Math.floor(startNode / nrNodesPerRow)][startNode % nrNodesPerRow].classList.add("visited-start-node");


    while (queue.length != 0) {
        let u = queue.shift();
        for (let i = 0; i < adjList[u].length; i++) {
            if (visited[adjList[u][i]] == false) {
                visited[adjList[u][i]] = true;
                distances[adjList[u][i]] = distances[u] + 1;
                shortestPath[adjList[u][i]] = u;
                queue.push(adjList[u][i]);
                nodesMatrix[Math.floor(adjList[u][i] / nrNodesPerRow)][adjList[u][i] % nrNodesPerRow].classList.add("visited-node");

                if (adjList[u][i] == endNode)
                    return true;
                await sleep(1);
            }
        }
    }
    return false;
}

function initStack() {
    var Stack = function() {
        this.items = [];
    };
    Stack.prototype.push = function(obj) {
        this.items.push(obj);
    };
    Stack.prototype.pop = function() {
        return this.items.pop();
    };
    Stack.prototype.isEmpty = function() {
        return this.items.length === 0;
    };
    Stack.prototype.isExplored = function(n) {
        return this.items.indexOf(n) !== -1;
    }
    Stack.prototype.emptyOut = function() {
        this.items = [];
        return this.items.length === 0;
    };

    return new Stack();
}

async function DFSIterative(adjList, startNode = 1060, endNode = 1110) {
    var queue = [startNode];
    let visited = [];

    while (queue.length) {
        startNode = queue.shift();
        visited[startNode] = true;
        nodesMatrix[Math.floor(startNode / nrNodesPerRow)][startNode % nrNodesPerRow].classList.add("visited-node");
        await sleep(1);

        if (startNode == endNode) {
            break;
        }
        // if (stack.isExplored(startNode)) {
        //     continue;
        // }
        stack.push(startNode);

        if (visited != true) {
            queue.push(adjList[startNode][0]);
            visited[adjList[startNode][0]] = true;
        }
        previous = startNode;
    }

}

async function DFS2(adjList, node = 1060, endNode = 1110) {
    let s = initStack();
    let explored = new Set();
    s.push(node);

    // Mark the first node as explored
    explored.add(node);

    // We'll continue till our Stack gets empty
    while (!s.isEmpty() && s != endNode) {
        let t = s.pop();

        nodesMatrix[Math.floor(t / nrNodesPerRow)][t % nrNodesPerRow].classList.add("visited-node");
        await sleep(1);

        // 1. In the edges object, we search for nodes this node is directly connected to.
        // 2. We filter out the nodes that have already been explored.
        // 3. Then we mark each unexplored node as explored and push it to the Stack.
        adjList[t]
            .filter(n => !explored.has(n))
            .forEach(n => {
                explored.add(n);
                s.push(n);
            });
    }
}

async function DFSRecursive(adjList, startNode = 1060, endNode = 1110) {
    if (startNode == endNode) {
        return startNode;
    }

    for (var i = 0; i < adjList[startNode].length; i++) {
        nodesMatrix[Math.floor(startNode / nrNodesPerRow)][startNode % nrNodesPerRow].classList.add("visited-start-node");
        var result = DFS(adjList, adjList[startNode][i], endNode);
        if (result != null) {
            return result;
        }
    }
    return null;
}

function createAdjList(nodesMatrix) {
    let adjList = [];
    for (let i = 0; i < totalNodes; i++) {
        adjList[i] = [];
    }
    let k = 0;
    for (let i = 0; i < nrRows; i++) {
        for (let j = 0; j < nrNodesPerRow; j++) {
            if (!nodesMatrix[i][j].classList.contains("blocked-node")) {
                if (i > 0 && !nodesMatrix[i - 1][j].classList.contains("blocked-node")) {
                    adjList[k - nrNodesPerRow].push(k);
                    adjList[k].push(k - nrNodesPerRow);
                }
                if (j < nrNodesPerRow - 1 && !nodesMatrix[i][j + 1].classList.contains("blocked-node")) {
                    adjList[k].push(k + 1);
                    adjList[k + 1].push(k);
                }
                if (i < nrRows - 1 && !nodesMatrix[i + 1][j].classList.contains("blocked-node")) {
                    adjList[k + nrNodesPerRow].push(k);
                    adjList[k].push(k + nrNodesPerRow);
                }
                if (j > 0 && !nodesMatrix[i][j - 1].classList.contains("blocked-node")) {
                    adjList[k].push(k - 1);
                    adjList[k - 1].push(k);
                }
            }
            k++;
        }
    }
    for (let i = 0; i < totalNodes; i++) {
        adjList[i] = [...new Set(adjList[i])];
    }
    return adjList;
}

function createAdjListOneWay(nodesMatrix) {
    let adjList = [];
    for (let i = 0; i < totalNodes; i++) {
        adjList[i] = [];
    }
    let k = 0;
    for (let i = 0; i < nrRows; i++) {
        for (let j = 0; j < nrNodesPerRow; j++) {
            if (!nodesMatrix[i][j].classList.contains("blocked-node")) {
                if (i > 0 && !nodesMatrix[i - 1][j].classList.contains("blocked-node")) {
                    adjList[k - nrNodesPerRow].push(k);
                }
                if (j < nrNodesPerRow - 1 && !nodesMatrix[i][j + 1].classList.contains("blocked-node")) {
                    adjList[k].push(k + 1);
                }
                if (i < nrRows - 1 && !nodesMatrix[i + 1][j].classList.contains("blocked-node")) {
                    adjList[k + nrNodesPerRow].push(k);
                }
                if (j > 0 && !nodesMatrix[i][j - 1].classList.contains("blocked-node")) {
                    adjList[k].push(k - 1);
                }
            }
            k++;
        }
    }
    for (let i = 0; i < totalNodes; i++) {
        adjList[i] = [...new Set(adjList[i])];
    }
    return adjList;

}

async function generateRandomPattern(nodesMatrix, visited) {
    let startNode = [Math.floor(Math.random() * nrRows), Math.floor(Math.random() * nrNodesPerRow)];
    var path = [startNode];
    visited[startNode[0]][startNode[1]] = true;
    var visitedCount = 1;

    while (visitedCount < 600) {

        var potentialNodes = [
            [startNode[0] - 1, startNode[1], 0, 2],
            [startNode[0], startNode[1] + 1, 1, 3],
            [startNode[0] + 1, startNode[1], 2, 0],
            [startNode[0], startNode[1] - 1, 3, 1]
        ]; // top, right, bottom, left

        var neighbors = new Array();
        for (var l = 0; l < 4; l++) {
            if (potentialNodes[l][0] > -1 && potentialNodes[l][0] < nrRows && potentialNodes[l][1] > -1 && potentialNodes[l][1] < nrNodesPerRow && visited[potentialNodes[l][0]][potentialNodes[l][1]] == false) {
                neighbors.push(potentialNodes[l]);
            }
        }
        if (neighbors.length) {
            startNode = neighbors[Math.floor(Math.random() * neighbors.length)];
            if (!nodesMatrix[startNode[0]][startNode[1]].classList.contains("start-node") && !nodesMatrix[startNode[0]][startNode[1]].classList.contains("destination-node")) {
                nodesMatrix[startNode[0]][startNode[1]].classList.add("blocked-node");
            }
            visited[startNode[0]][startNode[1]] = true;
            path.push(startNode);
            visitedCount++;

            if (startNode[0] == 15 && startNode[1] == 60) {
                break;
            }
        }
        startNode = [Math.floor(Math.random() * nrRows), Math.floor(Math.random() * nrNodesPerRow)];
    }
};

function clearPattern(nodesMatrix, visited) {
    for (let i = 0; i < nrRows; i++) {
        for (let j = 0; j < nrNodesPerRow; j++) {
            if (nodesMatrix[i][j].classList.contains("blocked-node")) {
                nodesMatrix[i][j].classList.remove("blocked-node");
            }
            visited[i][j] = false;
        }
    }
}

var delayed = (function() {
    var queue = [];

    function processQueue() {
        if (queue.length > 0) {
            setTimeout(function() {
                queue.shift().cb();
                processQueue();
            }, queue[0].delay);
        }
    }

    return function delayed(delay, cb) {
        queue.push({ delay: delay, cb: cb });

        if (queue.length === 1) {
            processQueue();
        }
    };
}());

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}