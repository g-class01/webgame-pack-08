var Collisions = pc.createScript('collisions');

Collisions.attributes.add('speed', { type : 'number', default : 5 });
Collisions.attributes.add('triggerDistance', { type : 'number', default : 1.5 });
Collisions.attributes.add('collectDistance', { type : 'number', default : 3 });
Collisions.attributes.add('cookingStationDistance', { type : 'number', default : 3 });
Collisions.attributes.add('isKinematic', { type : 'boolean', default : false });
Collisions.prototype.initialize = function() {
    this.lastCollisionCheck = Date.now();
    this.lastDropTime       = Date.now();
    this.lastCollectTime    = Date.now();

    this.currentlyCollidingTriggers = [];

    this.app.on('Scene:Triggers', this.scanTriggers, this);
    this.app.on('Scene:Collision', this.scanCollisions, this);

    this.entity.on('Trigger:Reset', this.resetTrigger, this);

    this.scanTriggers();
    this.scanCollisions();
};

Collisions.prototype.resetTrigger = function() {
    this.lastTriggerEntity = false;
    this.isColliding = false;
};

Collisions.prototype.scanTriggers = function() {
    this.triggers = this.app.root.findByTag('Trigger');
};

Collisions.prototype.scanCollisions = function(){
    this.collisions = this.app.root.findByTag('Collision');
    this.collisions.forEach(function(entity){
        
    });
};

Collisions.prototype.checkCollision = function(dt) {
    if(Date.now() - this.lastCollisionCheck < 80){
        return false;
    }

    var position = this.entity.getPosition();
    var i = this.triggers.length;
    var currentlyCollidingTriggers = [];

    // Check if entity is already interacting with a "Collect" object
    var isCollecting = this.lastTriggerEntity && this.lastTriggerEntity.tags.list().indexOf('Collect') > -1;

    while(i--){
        var trigger = this.triggers[i];

        if(trigger && trigger.enabled && trigger.parent){
            var triggerPosition = trigger.getPosition().clone();
            var distance = Utils.distance(
                triggerPosition.x, triggerPosition.z,
                position.x, position.z
            );

            var totalDistance = this.triggerDistance;

            if(trigger.tags.list().indexOf('Collect') > -1){
                totalDistance = this.collectDistance;

                // If entity is already interacting with a "Collect" object, skip triggers that are not the current one
                if (isCollecting && trigger !== this.lastTriggerEntity) {
                    continue;
                }
            }

            if(trigger.tags.list().indexOf('CookingStation') > -1){
                totalDistance = this.cookingStationDistance;
            }

            if(distance < totalDistance){
                if(trigger.tags.list().indexOf('Loop') > -1){
                    trigger.fire('Trigger', this.entity);
                    this.lastTriggerEntity = trigger;
                } else {
                    if(this.lastTriggerEntity !== trigger){
                        trigger.fire('Trigger', this.entity);
                        this.lastTriggerEntity = trigger;
                    }
                }

                currentlyCollidingTriggers.push(trigger);
            }
        }
    }

    // Fire "Leave" event for triggers that the entity is no longer colliding with
    for (i = 0; i < this.currentlyCollidingTriggers.length; i++) {
        var trigger = this.currentlyCollidingTriggers[i];
        if (!currentlyCollidingTriggers.includes(trigger)) {
            trigger.fire('Leave', this.entity);
        }
    }

    // Reset lastTriggerEntity if player is not colliding with any trigger
    if (currentlyCollidingTriggers.length === 0) {
        this.lastTriggerEntity = null;
    }

    this.currentlyCollidingTriggers = currentlyCollidingTriggers;
    this.lastCollisionCheck = Date.now();
};

Collisions.prototype.hasAnyCollision = function(){
    return this.isColliding;
};

Collisions.prototype.checkBorderCollision = function(dt){
    var playerPosition = this.entity.getPosition();
    var j = this.collisions.length;

    while(j--){
        var collision = this.collisions[j];

        if(collision && collision.enabled && collision.collision){
            var distancePosition  = collision.getPosition();
            var distanceCollision = collision.getPosition().clone().sub(
                playerPosition.clone()
            ).length();
            var distanceScale = collision.collision.radius;

            if(distanceCollision < distanceScale){
                var direction = Utils.lookAt(
                    playerPosition.x,
                    playerPosition.z,
                    distancePosition.x,
                    distancePosition.z
                );

                var forceDirection = direction - Math.PI;
                var posCollisionX = Math.cos(forceDirection) * this.speed * dt;
                var posCollisionZ = Math.sin(forceDirection) * this.speed * dt;

                if(collision.tags.list().indexOf('Kinematic') > -1){
                    collision.translateLocal(
                        posCollisionZ,
                        0,
                        -posCollisionX
                    );
                }else{
                    if(!this.isKinematic){
                        this.entity.translateLocal(
                            posCollisionZ,
                            0,
                            posCollisionX
                        );

                        this.entity.fire('Collision', collision, dt);
                    }
                }
            }

            if(collision.tags.list().indexOf('Kinematic') > -1){
                if(!collision.originalPosition){
                    collision.originalPosition = collision.getPosition().clone();
                }

                var position = collision.getPosition().clone().lerp(
                    collision.getPosition(),
                    collision.originalPosition,
                    0.05
                );

                collision.setPosition(
                    position
                );

                if(distanceCollision < distanceScale){
                    collision.fire('Collision');
                }
            }
        }
    }
};

Collisions.prototype.update = function(dt){
    //Halt collisions during explicit pause / ad (timeScale===0) and while a
    //popup/menu is open. The popup branch keeps customers, the player and
    //carry physics from sliding into anything while the player is reading UI.
    if(pc.app.timeScale === 0 || pc.hasActivePopup){
        return false;
    }
    
    if(!this.isKinematic){
        if(
            this.entity.script.building &&
            this.entity.script.building.currentBuilding
        ){

        }else{
            this.checkCollision(dt);
        }
    }
    
    this.checkBorderCollision(dt);
};