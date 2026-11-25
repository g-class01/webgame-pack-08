var World2Screen = pc.createScript('world2Screen');

World2Screen.attributes.add('cameraEntity', { type : 'entity' });
World2Screen.attributes.add('holderEntity', { type : 'entity' });
World2Screen.attributes.add('belowEntity', { type : 'entity' });
World2Screen.attributes.add('orderHolder', { type : 'entity' });
World2Screen.attributes.add('display', { type : 'entity', array : true });

World2Screen.prototype.postInitialize = function() {
    this.interactions = [];
    //this.cameraEntity = this.app.root.findByName('Lens');
    
    this.frameDrawn = 0;
    this.nextFrameVisible = false;
    
    this.app.on('World2Screen:Clone', this.cloneInteraction, this);
    this.app.on('World2Screen:Show', this.addInteraction, this);
    this.app.on('World2Screen:Visible', this.visibleInteraction, this);
    this.app.on('World2Screen:Hide', this.removeInteraction, this);
    
    this.hideAllDisplays();
    
    this.on('destroy', this.onDestroy, this);
};

World2Screen.prototype.hideAllDisplays = function() {
    for(var index in this.display){
        var display = this.display[index];
        
        display.enabled = false;
    }
};

World2Screen.prototype.onDestroy = function() {
    this.app.off('World2Screen:Show', this.setInteraction, this);
};

World2Screen.prototype.getInteractionDisplay = function(type) {
    var output = false;
    
    for(var index in this.display){
        var display = this.display[index];
        
        if(display.name == type){
            output = display;
        }
    }
    
    return output;
};

World2Screen.prototype.removeInteraction = function(type, entity) {
    var display = this.getInteractionDisplay(type);
    
    if(display){
        display.enabled = false;
        display.entity  = false;
    }
};

World2Screen.prototype.addInteraction = function(type, entity, offset) {
    var display = this.getInteractionDisplay(type);
    
    if(display){
        if(display.entity != entity){
            display.enabled = false;
        }
        
        if(offset){
            display.offset    = offset;    
        }else{
            display.offset    = new pc.Vec3(0, 0, 0);
        }
        
        display.entity    = entity;
        display.type      = type;
        display.enabled   = true;
        
        display.createdAt = Date.now();
    }
};

World2Screen.prototype.cloneInteraction = function(
    type, entity, offset, callback
) {
    var display = this.getInteractionDisplay(type);
    var self = this;
    
    if(display){
        display = display.clone();
        display.name = entity._guid;
        display.enabled = true;
        
        if(offset){
            display.offset    = offset;    
        }else{
            display.offset    = new pc.Vec3(0, 0, 0);
        }
        
        display.entity    = entity;
        display.type      = type;
        display.enabled   = true;
        
        display.createdAt = Date.now();

        if(callback){
            callback(display);
        }

        entity.on('destroy', function(){
            self.display.splice(self.display.indexOf(display), 1);
            display.destroy();
        });

        this.holderEntity.addChild(display);
        this.display.push(display);
    }
};

World2Screen.prototype.visibleInteraction = function(type, entity, offset) {
    this.addInteraction(type, entity, offset);
    
    this.frameDrawn = 0;
    this.nextFrameVisible = type;
};

World2Screen.prototype.updateInteraction = function(interaction) {
    if(!this.cameraEntity){
        return false;
    }
    
    var screenPos = new pc.Vec3();
    var camera    = this.cameraEntity.camera;
    var ratio     = this.app.graphicsDevice.maxPixelRatio;
    
    var screenEntity = this.entity.screen;
    var scale  = screenEntity.scale;
    var device = this.app.graphicsDevice;
    
    if(!camera){
        return false;
    }
    
    if(!interaction.entity){
        return false;
    }
    
    if(interaction.offset && interaction.offset.name){
        camera.worldToScreen(
            interaction.offset.getPosition().clone(), 
            screenPos
        );
    }else{
        camera.worldToScreen(
            interaction.entity.getPosition().clone().add(interaction.offset), 
            screenPos
        );
    }
    
    screenPos.x *= ratio;
    screenPos.y *= ratio;
    //screenPos.x > 0 && 

    if(
        screenPos.x < this.app.graphicsDevice.width &&
        screenPos.y > 0 && screenPos.y < this.app.graphicsDevice.height &&
        screenPos.z > 0
    ){
        interaction.reparent(this.holderEntity);
        interaction.setLocalPosition(
            screenPos.x / scale, 
            (device.height - screenPos.y) / scale, 
            0
        );
        
        interaction.enabled = interaction.entity.enabled;
    }else{
        interaction.reparent(this.orderHolder);
        interaction.setLocalPosition(0, 0, 0);

        //interaction.enabled = false;
    }
};

World2Screen.prototype.update = function(dt) {
    var i = this.display.length;
    
    while(i--){
        var display = this.display[i];
        
        if(display){
            this.updateInteraction(display);
        }
    }
    
    if(this.nextFrameVisible && this.frameDrawn > 0){
        this.removeInteraction(this.nextFrameVisible);   
    }
    
    this.frameDrawn++;
};