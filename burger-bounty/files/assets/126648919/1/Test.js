var Test = pc.createScript('test');

// initialize code called once per entity
Test.prototype.initialize = function() {
    this.progress = 1;
};

// update code called every frame
Test.prototype.update = function(dt) {
    if(this.app.keyboard.wasPressed(pc.KEY_SPACE)){
        this.app.fire('DirtyPlate:Created');
    }
};