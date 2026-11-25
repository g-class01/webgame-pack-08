var PointClick = pc.createScript('pointClick');

PointClick.attributes.add('cameraEntity', { type : 'entity' });
PointClick.attributes.add('markerEntity', { type : 'entity' });
PointClick.prototype.initialize = function() {
    this.ray = new pc.Ray();
    this.hitPosition = new pc.Vec3();

    this.shape = new pc.BoundingBox(
        this.entity.getPosition(), 
        this.entity.collision.halfExtents
    );

    this.app.on('PointClick:Reach', this.onReach, this);

    if(!this.app.touch){
        this.app.mouse.on('mousedown', this.onClick, this);
    }    
    //this.app.mouse.on('mousemove', this.onReach, this);
};

PointClick.prototype.onReach = function(){
    this.markerEntity.enabled = false;
    this.app.fire('PointClick:Position', false);
};

PointClick.prototype.onClick = function(screenPosition){
    if(pc.lastClickTime && Date.now() - pc.lastClickTime < 100){
        return false;
    }

    this.cameraEntity.camera.screenToWorld(
        screenPosition.x, 
        screenPosition.y, 
        this.cameraEntity.camera.farClip, 
        this.ray.direction
    );
    
    this.ray.origin.copy(this.cameraEntity.getPosition());
    this.ray.direction.sub(this.ray.origin).normalize();

    var result = this.shape.intersectsRay(this.ray, this.hitPosition);

    if (result) {
        this.markerEntity.setPosition(this.hitPosition);
        this.markerEntity.enabled = true;

        this.app.fire('PointClick:Position', this.hitPosition);
    }
};