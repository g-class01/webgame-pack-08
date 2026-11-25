var DecorationManager = pc.createScript('decorationManager');

DecorationManager.attributes.add('suffix', { type : 'string', default : '' });
DecorationManager.attributes.add('floorEntity', { type : 'entity' });
DecorationManager.attributes.add('secondFloorEntity', { type : 'entity' });
DecorationManager.attributes.add('wallEntities', { type : 'entity', array : true });
DecorationManager.prototype.initialize = function() {
    this.onStateChange(true);
    this.on('state', this.onStateChange, this);
    this.on('destroy', this.onDestroy, this);
};

DecorationManager.prototype.onStateChange = function(state) {
    if(state === true){
        var floor = Utils.getItem('Floor' + this.suffix);
    
        if(floor){
            this.setFloor(floor);
        }

        var wall = Utils.getItem('Wall' + this.suffix);
        
        if(wall){
            this.setWall(wall);
        }
        
        this.app.on('Decoration:SetFloor', this.setFloor, this);
        this.app.on('Decoration:SetWall', this.setWall, this);
    }else{
        this.app.off('Decoration:SetFloor', this.setFloor, this);
        this.app.off('Decoration:SetWall', this.setWall, this);
    }
};

DecorationManager.prototype.onDestroy = function() {
    this.onStateChange(false);
};

DecorationManager.prototype.setFloor = function(name) {
    var self = this;
    var material = this.app.assets.find(name);

    material.ready(function(){
        self.floorEntity.model.meshInstances[0].material = material.resource;
        if(self.secondFloorEntity){
            self.secondFloorEntity.model.meshInstances[0].material = material.resource;
        }
    });

    this.app.assets.load(material);
    Utils.setItem('Floor' + this.suffix, name);
};

DecorationManager.prototype.setWall = function(name) {
	var self = this;
    var material = this.app.assets.find(name);

    material.ready(function(){
        self.wallEntities.forEach(function(wallEntity){
            wallEntity.model.meshInstances[0].material = material.resource;
        });
    });

    this.app.assets.load(material);
    Utils.setItem('Wall' + this.suffix, name);
};