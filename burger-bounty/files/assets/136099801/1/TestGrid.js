var TestGrid = pc.createScript('testGrid');

// initialize code called once per entity
TestGrid.prototype.initialize = function() {

};

// update code called every frame
TestGrid.prototype.update = function(dt) {
    if(this.app.keyboard.wasPressed(pc.KEY_SPACE)){
        var self = this;
    
        this.app.fire(
            'PathFinding:Find', 
            this.entity.getPosition(), 
            this.app.root.findByName('Cash').getPosition(), 
            function(path){
                self.entity.fire('Path:Move', path);
            }
        );
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// TestGrid.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/