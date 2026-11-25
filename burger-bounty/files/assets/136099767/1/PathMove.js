var PathMove = pc.createScript('pathMove');

PathMove.attributes.add('directionEntity', { type : 'entity' });
PathMove.attributes.add('speed', { type : 'number', default : 0.025 });
PathMove.attributes.add('turnSpeed', { type : 'number', default : 0.15 });
PathMove.prototype.initialize = function() {
    this.direction = 0;
    this.nextDirection = 90;

    this.randomizedVector = new pc.Vec3();

    this.speedFactor = Math.random() * 0.01;

    this.isMoving    = false;
    this.isFocusing  = false;
    this.path        = [];

    this.entity.on('Path:Move', this.setPath, this);
    this.entity.on('Path:Stop', this.stopMoving, this);
    this.entity.on('Path:Focus', this.setFocus, this);
};

PathMove.prototype.stopMoving = function() {
    this.isMoving  = false;
    this.path      = [];
};

PathMove.prototype.setFocus = function(entity) {
    this.isFocusing = entity;
};

PathMove.prototype.update = function(dt) {
    //Halt path traversal while a popup is open so waiter/waitress/customer
    //path-driven entities freeze in place under the menu instead of sliding
    //along their routes.
    if(pc.hasActivePopup){
        return;
    }
    var pos = this.entity.getLocalPosition();

    if(this.isFocusing){
        var target  = this.isFocusing.getPosition();

        this.nextDirection = Utils.lookAt(pos.x, pos.z, target.x, target.z);
        
    }

    if(this.isFocusing || this.isMoving){
        this.direction = Utils.rotate(this.direction, this.nextDirection, this.turnSpeed);
    }

    this.directionEntity.setLocalEulerAngles(0, this.direction * pc.math.RAD_TO_DEG, 0);

    if (this.isMoving && this.path.length > 0){
        var target = this.path[0].clone().add(this.randomizedVector);
        var dist = new pc.Vec3().sub2(target, pos);

        this.nextDirection = Utils.lookAt(
            this.entity.getLocalPosition().x,
            this.entity.getLocalPosition().z,
            target.x,
            target.z
        );

        if ( dist.length() < 0.15 ) {
            this.path.shift();
        } else {
            dist.normalize().scale(this.speed + this.speedFactor);
            this.entity.translateLocal(dist);
        }
    }

    this.entity.fire('Path:State', this.isMoving);
};

PathMove.prototype.setPath = function(path) {
    if(path.length > 0){
        this.path = path;

        var pos = this.entity.getLocalPosition();
        var target = this.path[this.path.length - 1].clone();
        var dist = new pc.Vec3().sub2(target, pos);

        if (dist.length() > 1.0) {
            this.isFocusing = false;
            this.isMoving = true;
        }
    }else{
        this.isFocusing = false;
        this.isMoving = false;
    }
};