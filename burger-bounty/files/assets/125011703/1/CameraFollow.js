var CameraFollow = pc.createScript('cameraFollow');

CameraFollow.attributes.add('cameraEntity', { type : 'entity' });
CameraFollow.attributes.add('followEntity', { type : 'entity' });
CameraFollow.attributes.add('playerEntity', { type : 'entity' });
CameraFollow.attributes.add('movementEntity', { type : 'entity' });
CameraFollow.attributes.add('arrowEntity', { type : 'entity' });
CameraFollow.attributes.add('speed', { type : 'number', default : 0.1 });
CameraFollow.prototype.initialize = function() {
    this.offset = new pc.Vec3(0, 0, 0);
    this.nextOffset = new pc.Vec3(0, 0, 0);

    this.isFocusing = false;

    this.lastFollowedEntity = false;
    this.lastFocusing = false;

    this.defaultVector = new pc.Vec3(0, 0, 0);

    //this.arrowEntity.enabled = false;

    this.app.on('Camera:Focus', this.setCameraFocus, this);
    this.app.on('Camera:Offset', this.setCameraOffset, this);
    this.app.on('Camera:Zoom', this.adjustZoomLevel, this);

    this.zoomLevel = 1;
	this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
};

CameraFollow.prototype.onMouseWheel = function(event){
    if(pc.hasActivePopup){
        return false;
    }
    
    //add wheel zoom in/out
	var delta = event.wheelDelta;

    if(delta > 0){
        this.zoomLevel+=0.1;
    }else{
        this.zoomLevel-=0.1;
    }

    //min 0, max 1
    this.zoomLevel = Math.min(Math.max(this.zoomLevel, -1.0), 1.0);
};

CameraFollow.prototype.adjustZoomLevel = function(){
    this.zoomLevel-=0.25;

    if(this.zoomLevel < -1.0){
        this.zoomLevel = 1.0;
    }

    //this.zoomLevel = Math.min(Math.max(this.zoomLevel, -1.0), 1.0);
};

CameraFollow.prototype.setCameraOffset = function(offset) {
    this.nextOffset = offset;
};

CameraFollow.prototype.setCameraFocus = function(entity, time) {
    if(!entity){
        return false;
    }

    if(entity == this.followEntity){
        return false;
    }

    if(entity == this.lastFollowedEntity){
        return false;
    }

    if(Date.now() - this.lastFocusing < 500){
        return false;
    }

    this.followEntity = entity;
    this.speed = 0.1;
    this.isFocusing = true;

    this.movementEntity.script.movement.isLocked = true;

    this.entity.sound.play('Spinning');
    Timer.clearTimeout(this.cameraTimer);

    this.lastFollowedEntity = entity;

    this.lastFollowedEntityTimer = Timer.setTimeout(function(self){
        self.lastFollowedEntity = false;
    }, 5000, this);
    
    this.cameraTimer = Timer.setTimeout(function(self){
        self.movementEntity.script.movement.isLocked = false;

        self.entity.sound.play('Spinning');
        self.followEntity = self.playerEntity;
        self.speed = 0.5;
        self.isFocusing = false;
    }, time ? time : 2000, this);

    this.lastFocusing = Date.now();
};

CameraFollow.prototype.updateZoomLevel = function() {
    if(Utils.isMobile()){
        this.cameraEntity.setLocalPosition(0, 0, 25 + this.zoomLevel * 5);
    }else{
        this.cameraEntity.setLocalPosition(0, 0, 15 + this.zoomLevel * 5);
    }
};

CameraFollow.prototype.update = function(dt) {
    this.updateZoomLevel();

    if(!this.followEntity){
        return false;
    }
    
    var position = this.entity.getPosition().lerp(
        this.entity.getPosition(),
        this.followEntity.getPosition(),
        this.speed
    );

    this.offset = this.offset.lerp(
        this.offset,
        this.nextOffset,
        0.05
    );

    this.nextOffset = this.nextOffset.lerp(
        this.nextOffset,
        this.defaultVector,
        0.01
    );

    if(this.isFocusing){
        this.entity.setPosition(position);
    }else{
        this.entity.setPosition(position.add(this.nextOffset));
    }
};