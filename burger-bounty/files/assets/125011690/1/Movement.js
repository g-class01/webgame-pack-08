var Movement = pc.createScript('movement');

Movement.attributes.add('speed', { type : 'number', default : 0.1 });
Movement.attributes.add('speedUp', { type : 'number', default : 10 });
Movement.attributes.add('turnSpeed', { type : 'number', default : 0.05 });
Movement.attributes.add('originEntity', { type : 'entity' });
Movement.attributes.add('characterEntity', { type : 'entity' });
Movement.attributes.add('hoverEntity', { type : 'entity' });
Movement.attributes.add('touchEntity', { type : 'entity' });
Movement.attributes.add('touchStartEntity', { type : 'entity' });
Movement.attributes.add('touchMoveEntity', { type : 'entity' });
Movement.attributes.add('touchDirectionEntity', { type : 'entity' });
Movement.attributes.add('pointClickGround', { type : 'entity' });
Movement.attributes.add('pointClickMarker', { type : 'entity' });
Movement.attributes.add('cameraEntity', { type : 'entity' });
Movement.attributes.add('leftFoot', { type : 'entity' });
Movement.attributes.add('rightFoot', { type : 'entity' });
Movement.attributes.add('boostParticles', { type : 'entity' });
Movement.attributes.add('windEffect', { type : 'entity' });
Movement.attributes.add('isHovering', { type : 'boolean', default : false });
Movement.attributes.add('isLocked', { type : 'boolean', default : false });

Movement.prototype.initialize = function() {
    this.direction = 90;
    this.nextDirection = 90;

    this.isTouchMoved = false;
    this.pointClickPosition = false;

    this.leanAngle = 0;

    this.floorType = 'Wood';
    this.grounds   = this.app.root.findByTag('Ground');

    this.lastCarryTime = -1;

    this.traceIndex = 0;
    this.isCarrying = false;
    this.stopThreshold = 0;

    this.currentSpeed = 0;

    //this.isTouching   = false;
    this.touchStart   = new pc.Vec2(0, 0);
    this.currentTouch = new pc.Vec2(0, 0);

    this.stepIndex = 1;
    this.isRunning = false;

    this.characterEntity.anim.on('Sound', this.playSound, this);
    this.initializeTouch();

    if(this.app.touch){
        /*this.app.touch.on('touchstart', this.onTouchStart, this);
        this.app.touch.on('touchmove', this.onTouchMove, this);
        this.app.touch.on('touchend', this.onTouchEnd, this);*/

        
    } else {
        /*
        this.app.mouse.on('mousedown', this.onTouchStart, this);
        this.app.mouse.on('mousemove', this.onTouchMove, this);
        this.app.mouse.on('mouseup', this.onTouchEnd, this);
        */

        this.app.on('PointClick:Position', this.onPointerPosition, this);
    }

    this.entity.on('Carry', this.setCarryState, this);
    this.entity.on('Collision', this.onCollision, this);

    this.app.on('Carry:Has', this.hasCarry, this);
    this.app.on('Player:Boost', this.boost, this);
    this.app.on('Player:Stop', this.stop, this);
};

Movement.prototype.onCollision = function(entity, dt) {
    this.stopThreshold+=dt;
};

Movement.prototype.onPointerPosition = function(position) {
    this.pointClickPosition = position;
    this.stopThreshold = 0;
};

Movement.prototype.stop = function() {
    this.isTouching = false;
    this.isRunning  = false;

    this.pointClickPosition = false;
    this.stopThreshold = 0;

    this.isLocked   = true;

    clearTimeout(this.stopTimer);
    this.stopTimer = setTimeout(function(self){
        self.isLocked = false;
    }, 1000, this);
};

Movement.prototype.boost = function() {
    this.speed = 6;
    this.turnSpeed = 0.7;

    this.characterEntity.anim.speed = 1.2;

    this.windEffect.enabled = true;
    this.boostParticles.enabled = true;
    this.app.fire('MusicManager:Pitch', 1.5);

    setTimeout(function(self){
        self.speed = 4;
        self.turnSpeed = 0.2;
        self.characterEntity.anim.speed = 1;

        self.boostParticles.enabled = false;
        self.windEffect.enabled = false;

        pc.app.fire('MusicManager:Pitch', 1);
    }, 1000 * 25, this);
};

Movement.prototype.hasCarry = function(value, callback, error) {
    if(this.isCarrying){
        callback();
    }else{
        error();
    }
};

Movement.prototype.setCarryState = function(state){
    this.isCarrying = state;
};

Movement.prototype.initializeTouch = function(){
    this.isTouching   = false;
    this.touchEntity.enabled = false;

    if(this.app.touch){
        this.app.touch.on('touchstart', this.onTouchStart, this);
        this.app.touch.on('touchmove', this.onTouchMove, this);
        this.app.touch.on('touchend', this.onTouchEnd, this);
    }
    
    if(this.app.mouse){
        this.app.mouse.on('mousedown', this.onTouchStart, this);
        this.app.mouse.on('mousemove', this.onTouchMove, this);
        this.app.mouse.on('mouseup', this.onTouchEnd, this);
    }

    this.touchStart   = new pc.Vec2(0, 0);
    this.currentTouch = new pc.Vec2(0, 0);
};

Movement.prototype.onTouchStart = function(event){
    if(this.isLocked || pc.hasActivePopup){
        return false;
    }

    var touches = event.touches;

    if(!touches){
        touches = [event];
    }

    if(touches.length > 0){
        this.touchStart.x = touches[0].x;
        this.touchStart.y = touches[0].y;
        this.isTouchMoved = false;

        this.totalMouseDistance = 0;

        /*
        this.touchStartEntity.setLocalPosition(
            this.touchStart.x * 2.0,
            (this.app.graphicsDevice.height - this.touchStart.y) * 2.0,
            0
        );
        */

        this.setTouchEntityPosition();              

        //this.touchEntity.enabled = true;

        this.isTouching = true;
    }
};

Movement.prototype.setTouchEntityPosition = function(){
    var canvas = this.app.graphicsDevice.canvas;
    var ndcX = (this.touchStart.x / canvas.clientWidth) * 2 - 1;
    var ndcY = 1 - (this.touchStart.y / canvas.clientHeight) * 2;

    this.touchEntity.setPosition(ndcX, ndcY, 0);
};

Movement.prototype.onTouchMove = function(event){
    if(!this.isTouching || this.isLocked || pc.hasActivePopup){
        return false;
    }
    /*var touches = event.touches;

    if(touches.length > 0){
        this.currentTouch.x = touches[0].x;
        this.currentTouch.y = touches[0].y;
        this.isTouchMoved   = true;

        this.touchMoveEntity.setLocalPosition(
            this.currentTouch.x * 2.0,
            (this.app.graphicsDevice.height - this.currentTouch.y) * 2.0,
            0
        );

        this.touchMoveEntity.enabled = true;
    }*/

    var touches = event.touches;

    if(!touches){
        touches = [event];
    }

    if(touches.length > 0){
        this.currentTouch.x = touches[0].x;
        this.currentTouch.y = touches[0].y;
        this.isTouchMoved   = true;

        /*
        this.touchMoveEntity.setLocalPosition(
            this.currentTouch.x * 2.0,
            (this.app.graphicsDevice.height - this.currentTouch.y) * 2.0,
            0
        );
        */
        var posX = this.currentTouch.x - this.touchStart.x;
        var posY = this.currentTouch.y - this.touchStart.y;

        var maxDistance = 75;

        //limit posX and posY
        if(posX > maxDistance){
            posX = maxDistance;
        }
        else if(posX < -maxDistance){
            posX = -maxDistance;
        }

        if(posY > maxDistance){
            posY = maxDistance;
        }
        else if(posY < -maxDistance){
            posY = -maxDistance;
        }

        this.touchMoveEntity.setLocalPosition(
            posX * 2.0,
            -posY * 2.0,
            0
        );

        this.totalMouseDistance = Utils.distance(
            this.touchStart.x, this.touchStart.y,
            this.currentTouch.x, this.currentTouch.y
        );

        this.touchMoveEntity.enabled = true;
        this.touchEntity.enabled = true;

        if (this.totalMouseDistance >= maxDistance) {
            var directionX = this.currentTouch.x - this.touchStart.x;
            var directionY = this.currentTouch.y - this.touchStart.y;

            var normalizedDirection = this.normalize(directionX, directionY);
            var clamp = Math.min(Math.max(this.totalMouseDistance, 0), maxDistance);
            var distance = clamp;

            this.touchStart.x = this.currentTouch.x - normalizedDirection.x * distance;
            this.touchStart.y = this.currentTouch.y - normalizedDirection.y * distance;

            this.setTouchEntityPosition();
        }
    }
};

Movement.prototype.normalize = function(x, y){
    var magnitude = Math.sqrt(x * x + y * y);
    if (magnitude === 0){
        return { x: 0, y: 0 };
    }
    return { x: x / magnitude, y: y / magnitude };
};

Movement.prototype.onTouchEnd = function(event){
    this.isTouching = false;

    this.touchEntity.enabled = false;
    /*this.touchStartEntity.enabled = false;
    this.touchMoveEntity.enabled = false;*/
};

Movement.prototype.updateFloorType = function() {
    var pos = this.entity.getPosition().clone();
        pos.y = -0.01;
    
    var i = this.grounds.length;

    while(i--){
        var ground = this.grounds[i];
        var containsPoint = ground.model.meshInstances[0].aabb.containsPoint(pos);

        if(containsPoint){
            this.floorType = ground.name;
        }
    }
};

Movement.prototype.playSound = function(data) {
    if(data.string == 'Run'){
        this.updateFloorType();

        var soundName = this.floorType + '-Run-' + this.stepIndex;
        var defaultPitch = 0.9;

        if(this.isCarrying){
            defaultPitch = 0.8;
        }

        this.entity.sound.slots[soundName].pitch = defaultPitch + Math.random() * 0.1;
        this.entity.sound.play(soundName);

        this.stepIndex++;

        if(this.stepIndex > 3){
            this.stepIndex = 1 + Math.round(Math.random() * 3);
        }
    }
};

Movement.prototype.footstepTrace = function() {
    if(!this.isRunning){
        return false;
    }

    if(Date.now() - this.lastFootstep < 150){
        return false;
    }

    this.traceIndex++;

    if(this.traceIndex > 1){
        this.traceIndex = 0;
    }

    this.lastFootstep = Date.now();
};

Movement.prototype.setTouch = function() {

    if(this.isLocked){
        return false;
    }

    if(this.isTouching && this.isTouchMoved){
        var direction = Utils.lookAt(
            this.touchStart.x,
            this.touchStart.y,
            this.currentTouch.x,
            this.currentTouch.y
        );

        this.nextDirection = (-direction + Math.PI / 2) * pc.math.RAD_TO_DEG;
        this.isRunning = true;

        this.touchDirectionEntity.setLocalEulerAngles(
            0, 0, -this.nextDirection
        );

        this.touchDirectionEntity.enabled = this.totalMouseDistance > 50;
    }

};

Movement.prototype.setKeyboard = function() {
    if(
        this.app.keyboard.isPressed(pc.KEY_W) ||
        this.app.keyboard.isPressed(pc.KEY_UP)
    ){
        this.nextDirection = -90;
        this.isRunning = true;
    }

    if(
        this.app.keyboard.isPressed(pc.KEY_A) ||
        this.app.keyboard.isPressed(pc.KEY_LEFT)
    ){
        this.nextDirection = -180;
        this.isRunning = true;
    }

    if(
        this.app.keyboard.isPressed(pc.KEY_D) ||
        this.app.keyboard.isPressed(pc.KEY_RIGHT)
    ){
        this.nextDirection = 0;
        this.isRunning = true;
    }

    if(
        this.app.keyboard.isPressed(pc.KEY_S) ||
        this.app.keyboard.isPressed(pc.KEY_DOWN)
    ){
        this.nextDirection = 90;
        this.isRunning = true;
    }

    if(
        (
            this.app.keyboard.isPressed(pc.KEY_W) ||
            this.app.keyboard.isPressed(pc.KEY_UP)
        ) &&
        (
            this.app.keyboard.isPressed(pc.KEY_A) ||
            this.app.keyboard.isPressed(pc.KEY_LEFT)
        )
    ){
        this.nextDirection = -135;
        this.isRunning = true;
    }

    if(
        (
            this.app.keyboard.isPressed(pc.KEY_W) ||
            this.app.keyboard.isPressed(pc.KEY_UP)
        ) &&
        (
            this.app.keyboard.isPressed(pc.KEY_D) ||
            this.app.keyboard.isPressed(pc.KEY_RIGHT)
        )
    ){
        this.nextDirection = -45;
        this.isRunning = true;
    }

    if(
        (
            this.app.keyboard.isPressed(pc.KEY_S) ||
            this.app.keyboard.isPressed(pc.KEY_DOWN)
        ) &&
        (
            this.app.keyboard.isPressed(pc.KEY_A) ||
            this.app.keyboard.isPressed(pc.KEY_LEFT)
        )
    ){
        this.nextDirection = 135;
        this.isRunning = true;
    }

    if(
        (
            this.app.keyboard.isPressed(pc.KEY_S) ||
            this.app.keyboard.isPressed(pc.KEY_DOWN)
        ) &&
        (
            this.app.keyboard.isPressed(pc.KEY_D) ||
            this.app.keyboard.isPressed(pc.KEY_RIGHT)
        )
    ){
        this.nextDirection = 45;
        this.isRunning = true;
    }

    if(this.isRunning){
        this.app.fire('PointClick:Reach');
    }
};

Movement.prototype.movePointClick = function(dt){
    if(this.isLocked){
        return false;
    }

    if(!this.isRunning && this.pointClickPosition){
        var playerPosition = this.entity.getPosition();

        var distance = Utils.distance(
            playerPosition.x, playerPosition.z,
            this.pointClickPosition.x, this.pointClickPosition.z
        );

        //console.log(distance, this.stopThreshold);

        if(distance < 0.25 || this.stopThreshold > 0.75){
            this.app.fire('PointClick:Reach');

            this.pointClickPosition = false;
            this.stopThreshold = 0;

            return false;
        }

        var direction = Utils.lookAt(
            playerPosition.x,
            playerPosition.z,
            this.pointClickPosition.x,
            this.pointClickPosition.z
        ); 

        this.nextDirection = (-direction + Math.PI / 2) * pc.math.RAD_TO_DEG;
        this.isRunning = true;
    }
};

Movement.prototype.setMovement = function(dt) {
    if(this.isLocked || pc.hasActivePopup){
        this.characterEntity.anim.setBoolean(
            'Running', false
        );

        //clear any in-flight touch UI from before the lock kicked in
        this.isTouching = false;
        if(this.touchEntity) this.touchEntity.enabled = false;
        if(this.touchMoveEntity) this.touchMoveEntity.enabled = false;
        if(this.touchDirectionEntity) this.touchDirectionEntity.enabled = false;

        return false;
    }
    
    this.isRunning = false;

    this.setKeyboard();
    this.setTouch();
    this.movePointClick(dt);

    if(this.isRunning){
        var turnSpeed = this.turnSpeed;

        if(this.isCarrying){
            turnSpeed*=0.5;
        }

        this.direction = Utils.rotate(
            this.direction,
            this.nextDirection * pc.math.DEG_TO_RAD,
            turnSpeed
        );

        var speed = this.speed;

        if(this.isCarrying){
            speed*=0.85;
        }

        if(this.isHovering){
            speed*=1.1;
        }

        this.currentSpeed = speed;

        var posX = Math.cos(this.direction) * this.currentSpeed * dt;
        var posZ = Math.sin(this.direction) * this.currentSpeed * dt;

        this.entity.translateLocal(
            posX,
            0,
            posZ
        );
    }else{
        this.currentSpeed = pc.math.lerp(
            this.currentSpeed,
            0,
            this.speedUp * dt
        );
    }

    this.originEntity.setLocalEulerAngles(
        0, 90 - this.direction * pc.math.RAD_TO_DEG, 0
    );

    this.characterEntity.anim.setBoolean(
        'Running', this.isRunning
    );

    this.characterEntity.anim.setBoolean(
        'Carry', this.isCarrying
    );

    this.characterEntity.anim.setBoolean(
        'Hovering', this.isHovering
    );

    if(this.isHovering){
        this.leanAngle = pc.math.lerpAngle(
            this.leanAngle,
            this.isRunning ? 1 : 0,
            0.1
        );

        this.characterEntity.setLocalEulerAngles(
            this.leanAngle * 8.0, 
            0, 
            0
        );

        this.characterEntity.setLocalPosition(0, 0.228, 0);
        this.entity.sound.slots['Hover'].volume = this.leanAngle * 0.25;
        this.entity.sound.slots['Hover'].pitch  = 0.5 + this.leanAngle * 0.25;
    }else{
        this.characterEntity.setLocalEulerAngles(
            0, 
            0, 
            0
        );

        this.entity.sound.slots['Hover'].volume = 0;
        this.characterEntity.setLocalPosition(0, 0, 0);
    }

    //this.hoverEntity.enabled = this.isHovering;
};

Movement.prototype.update = function(dt) {
    this.setMovement(dt);

    //Halt the post-setMovement update body during pause/ad (timeScale===0) and
    //while a popup/menu is open. setMovement already gates itself on
    //hasActivePopup (see top of this file); this extends the same guard to
    //footstep traces and hover polling so nothing dt-driven keeps ticking
    //while a menu is up.
    if(pc.app.timeScale === 0 || pc.hasActivePopup){
        return false;
    }

    this.isHovering = this.hoverEntity.enabled;

    this.footstepTrace();
};