//Use path finding system, move object on x and z. It's a 3D scene, playcanvas project. Manhattan

var Node = function(x, z) {
    this.x = x;
    this.z = z;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = null;    
    this.walkable = true;
};

var PathFinding = pc.createScript('pathFinding');

PathFinding.attributes.add('parentEntity', { type : 'entity' });
PathFinding.attributes.add('gridWidth', { type : 'number', default : 100 });
PathFinding.attributes.add('gridHeight', { type : 'number', default : 100 });
PathFinding.attributes.add('size', { type : 'number', default : 1 });
PathFinding.attributes.add('offset', { type : 'number', default : 1 });
PathFinding.prototype.initialize = function() {
    this.onStateChange(true);
    this.on('state', this.onStateChange, this);
    this.on('destroy', this.onDestroy, this);
};

PathFinding.prototype.onStateChange = function(state) {  
    if(state === true){
        this.grid = [];
        this.entities = [];

        this.app.on('PathFinding:Find', this.createPath, this);
    }else{
        this.app.off('PathFinding:Find', this.createPath, this);
    }
};

PathFinding.prototype.onDestroy = function() {
    this.onStateChange(false);
};

PathFinding.prototype.createPath = function(player, destination, callback) {
    var self = this;

    this.player = player;
    this.destination = destination;

    this.createGrid();

    //then, calculate path
    var path = this.calculatePath(
        this.snap(player.x), 
        this.snap(player.z), 
        this.snap(destination.x), 
        this.snap(destination.z)
    );
    
    //and move the entity
    if(path && callback){
        callback(path.map(function(node){
            return new pc.Vec3(
                node.x / self.size - parseInt(self.offset), 
                0, 
                node.z / self.size - parseInt(self.offset)
            );
        }));
    }else{
        console.error('Not possible to move!', pc.CountryName, destination);
    }
};

PathFinding.prototype.createGrid = function() {
    var i, j;
    for (i = -this.gridWidth; i < this.gridWidth; i++) {
        this.grid[i] = [];
        for (j = -this.gridHeight; j < this.gridHeight; j++) {
            this.grid[i][j] = new Node(i, j);
        }
    }

    this.obstacles = this.parentEntity.findByTag('Obstacle');

    //check obstacles
    for (i = 0; i < this.obstacles.length; i++) {
        var x = this.snap(this.obstacles[i].getPosition().x);
        var z = this.snap(this.obstacles[i].getPosition().z);

        /*
        if(this.obstacles[i].enabled){
            this.grid[x][z].walkable = false;
        }
        */
        this.grid[x][z].walkable = false;
    }
};

PathFinding.prototype.snap = function(number) {
    return Math.round(number * this.size) + this.offset;
};

PathFinding.prototype.calculatePath = function(startX, startZ, endX, endZ) {
    var openList = [];
    var closedList = [];
    var result = [];
    var currentNode = this.grid[startX][startZ];
    var endNode = this.grid[endX][endZ];

    if(!endNode){
        return false;
    }
    
    if(!endNode.walkable){
        return false;
    }

    openList.push(currentNode);

    while (openList.length > 0) {
        //find lowest F cost node on open list
        var lowestCost = openList[0];
        for (var i = 0; i < openList.length; i++) {
            if (openList[i].f < lowestCost.f) {
                lowestCost = openList[i];
            }
        }
        //switch it to closed list
        openList.splice(openList.indexOf(lowestCost), 1);
        closedList.push(lowestCost);

        //if it's the end node, build result array
        if (lowestCost.x === endNode.x && lowestCost.z === endNode.z) {
            var current = closedList[closedList.length - 1];
            while (current.parent) {
                result.push(current);
                current = current.parent;
            }
            openList = [];
            closedList = [];
            result.reverse();
            return result;
        }

        //check all adjacent nodes
        var adjacentNodes = this.getAdjacentNodes(lowestCost);
        for (i = 0; i < adjacentNodes.length; i++) {
            var adjacentNode = adjacentNodes[i];
            //if already on closed list or not walkable, skip
            if (closedList.indexOf(adjacentNode) !== -1 || !adjacentNode.walkable) {
                continue;
            }

            //if not on open list, calculate cost and add it
            if (openList.indexOf(adjacentNode) === -1) {
                adjacentNode.g = lowestCost.g + this.getCost(lowestCost, adjacentNode);
                adjacentNode.h = this.getCost(adjacentNode, endNode);
                adjacentNode.f = adjacentNode.g + adjacentNode.h;
                adjacentNode.parent = lowestCost;
                openList.push(adjacentNode);
            } else {
                //if it's already on open list, check if it's a better path
                if (adjacentNode.g > lowestCost.g + this.getCost(lowestCost, adjacentNode)) {
                    adjacentNode.g = lowestCost.g + this.getCost(lowestCost, adjacentNode);
                    adjacentNode.f = adjacentNode.g + adjacentNode.h;
                    adjacentNode.parent = lowestCost;
                }
            }
        }
    }
    return false;
};

PathFinding.prototype.getAdjacentNodes = function(node) {
    var adjacentNodes = [];
    //check all adjacent nodes
    if (node.x > 0) {
        adjacentNodes.push(this.grid[node.x - 1][node.z]);
    }
    if (node.x < this.gridWidth - 1) {
        adjacentNodes.push(this.grid[node.x + 1][node.z]);
    }
    if (node.z > 0) {
        adjacentNodes.push(this.grid[node.x][node.z - 1]);
    }
    if (node.z < this.gridHeight - 1) {
        adjacentNodes.push(this.grid[node.x][node.z + 1]);
    }
    return adjacentNodes;
};

PathFinding.prototype.getCost = function(nodeA, nodeB) {
    return 10;
};