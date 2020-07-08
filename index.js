const nrRows = 31;
const nrNodesPerRow = 70;
const totalNodes = nrRows * nrNodesPerRow;
const algorithms = ["Djikstra", "BFS", "DFS"];
const speeds = [{ name: "Turtle", value: 50 }, { name: "Dog", value: 25 }, { name: "Lightning", value: 1 }];

var speed = 50;
var pathCreationSpeed = 10;
var play = false;

window.onload = function () {
    feather.replace()
    var selectedAlgorithm = -1;

    initAnimations();

    let algorithmItems = document.getElementsByClassName("item-algorithm");

    for (let i = 0; i < algorithmItems.length; i++) {
        algorithmItems[i].onclick = function (ev) {
            selectedAlgorithm = i;
            document.querySelector("#visualize").innerHTML = "Visualize " + algorithms[i] +
                "<i class='custom-icon icon-visualize' id='lottie'></i>";
            loadPlayAnimation();
        };
    }

    let speedItems = document.getElementsByClassName("item-speed");

    for (let i = 0; i < speedItems.length; i++) {
        speedItems[i].onclick = function (ev) {
            speed = speeds[i].value;
            document.querySelector(".text-speed").innerHTML = speeds[i].name;
        };
    }

    const { nodesMatrix, visited } = initGrid();

    let btnVisualize = document.getElementById("visualize");
    btnVisualize.onclick = async () => {
        if (play) {
            if (selectedAlgorithm == 0) {

            } else if (selectedAlgorithm == 1) {
                visualizeBFS(nodesMatrix);
            } else if (selectedAlgorithm == 2) {
                visualizeDFS(nodesMatrix);
            }
        } else {
            window.location.reload();
        }
    }

    let btnRandomPattern = document.getElementById("random-pattern");
    btnRandomPattern.onclick = function () {
        clearPattern(nodesMatrix, visited);
        generateRandomPattern(nodesMatrix, visited)
    };

    let btnClear = document.getElementById("clear");
    btnClear.onclick = function () {
        clearAll(nodesMatrix, visited);
    };

    let nodes = document.getElementsByClassName("node");

    const createBlockedNode = function (node) {
        if (!(node.classList.contains("start-node") || node.classList.contains("destination-node"))) {
            if (!node.classList.contains("blocked-node")) {
                node.classList.add("blocked-node")
            } else {
                node.classList.remove("blocked-node");
            }
        }
    }

    window.addEventListener("mousedown", function () {
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].onmouseover = function (ev) {
                if (ev.buttons == 1) {
                    createBlockedNode(nodes[i])
                }
            };
        }
    });

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
function initAnimation(container, path, name) {
    var animation = bodymovin.loadAnimation({
        container: container, // Required
        path: path, // Required
        renderer: 'svg', // Required
        loop: false, // Optional
        autoplay: false, // Optional
        name: name, // Name for future reference. Optional.
    })
    return animation;
}
function initAnimations() {
    var animationTrash = initAnimation(document.getElementsByClassName('icon-trash')[0], "./assets/trash-v2.json", "trash-icon");
    let btnClear = document.getElementById("clear");
    btnClear.onmouseenter = function () {
        animationTrash.setDirection(1);
        animationTrash.play();
    }
    btnClear.onmouseleave = function () {
        animationTrash.setDirection(-1);
        animationTrash.play();
    }
    var animationSpeed = initAnimation(document.getElementById('icon-speed'), "./assets/skip-forward.json", "speed-icon");
    let btnSpeed = document.getElementById("drp-speed");
    btnSpeed.onmouseenter = function () {
        animationSpeed.setDirection(1);
        animationSpeed.play();
    }
    btnSpeed.onmouseleave = function () {
        animationSpeed.setDirection(-1);
        animationSpeed.play();
    }
    loadPlayAnimation();
}
function loadPlayAnimation() {
    var animationPlay = initAnimation(document.getElementsByClassName('icon-visualize')[0], "./assets/play-pause.json", "visualize-icon");
    let btnVisualize = document.getElementById("visualize");
    animationPlay.play();
    btnVisualize.onmousedown = function () {
        animationPlay.setDirection(play ? 1 : -1);
        animationPlay.play();
        play = !play;
    }
}

async function visualizeBFS(nodesMatrix) {
    let adjList = createAdjList(nodesMatrix)
    var predictedPath = [];

    if (await BFS(adjList, predictedPath, nodesMatrix) == false) {
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
        await sleep(pathCreationSpeed);
    }
}

async function visualizeDFS(nodesMatrix) {
    let adjList = createAdjList(nodesMatrix);
    let path = await DFSIterative(adjList, nodesMatrix);

    for (let i = 1; i < path.length - 1; i++) {
        nodesMatrix[Math.floor(path[i] / nrNodesPerRow)][path[i] % nrNodesPerRow].classList.add("path-node");
        await sleep(pathCreationSpeed);
    }
}

async function visualizeAStar(nodesMatrix) {

}

async function BFS(adjList, shortestPath, nodesMatrix, startNode = 1060, endNode = 1110) {
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
                await sleep(speed);
            }
        }
    }
    return false;
}

function initStack() {
    var Stack = function () {
        this.items = [];
    };
    Stack.prototype.push = function (obj) {
        this.items.push(obj);
    };
    Stack.prototype.pop = function () {
        return this.items.pop();
    };
    Stack.prototype.peek = function () {
        return this.items[this.items.length - 1];
    };
    Stack.prototype.isEmpty = function () {
        return this.items.length === 0;
    };
    Stack.prototype.isExplored = function (n) {
        return this.items.indexOf(n) !== -1;
    }
    Stack.prototype.emptyOut = function () {
        this.items = [];
        return this.items.length === 0;
    };

    return new Stack();
}

async function DFSIterative(adjList, nodesMatrix, startNode = 1060, endNode = 1110) {
    let visited = [];
    let stack = initStack();
    stack.push(startNode);
    let path = [];

    while (stack.isEmpty() == false) {

        let currentNode = stack.pop();
        path.push(currentNode);

        if (currentNode == endNode) {
            break;
        }

        if (currentNode != startNode) {
            nodesMatrix[Math.floor(currentNode / nrNodesPerRow)][currentNode % nrNodesPerRow].classList.add("visited-node");
        }
        await sleep(speed);

        if (visited[currentNode] != true) {
            visited[currentNode] = true;
        }
        for (let i = 0; i < adjList[currentNode].length; i++) {
            let nextNode = adjList[currentNode][i];
            if (visited[nextNode] != true) {
                stack.push(nextNode);
            }
        }
    }
    return path;
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

async function generateMazeKruskal() {
    let walls = [];
    for (let i = 0; i < totalNodes; i++) {
        walls.add(i);
    }
    let sets = [];
    let nextWall = Math.random(totalNodes);
    while (nextWall.length > 0) {

        nextWall = Math.random(totalNodes);
    }


}

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

function clearAll(nodesMatrix, visited) {
    for (let i = 0; i < nrRows; i++) {
        for (let j = 0; j < nrNodesPerRow; j++) {
            if (nodesMatrix[i][j].classList.contains("blocked-node")) {
                nodesMatrix[i][j].classList.remove("blocked-node");
            }
            if (nodesMatrix[i][j].classList.contains("visited-node")) {
                nodesMatrix[i][j].classList.remove("visited-node");
            }
            if (nodesMatrix[i][j].classList.contains("path-node")) {
                nodesMatrix[i][j].classList.remove("path-node");
            }
            visited[i][j] = false;
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}