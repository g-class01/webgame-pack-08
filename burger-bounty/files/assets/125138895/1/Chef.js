var Chef = pc.createScript('chef');

Chef.attributes.add('modelEntity', { type : 'entity' });
Chef.attributes.add('characterEntity', { type : 'entity' });
Chef.attributes.add('cookEvent', { type : 'string' });
Chef.attributes.add('cookTime', { type : 'number', default : 5 });

Chef.attributes.add('targets', { type : 'entity', array : true });
Chef.attributes.add('speed', { type : 'number', default : 1 });
Chef.attributes.add('turnSpeed', { type : 'number', default : 0.1 });

Chef.prototype.initialize = function() {
    this.targetIndex = 1;
    this.target = this.targets[this.targetIndex];
    this.lastCookTime = -1;

    this.direction = 0;
    this.nextDirection = 0;
};

Chef.prototype.update = function(dt) {
    //Halt chef pathing/cook ticks while a popup is open so kitchen workers
    //don't keep walking and triggering cook events under the menu.
    if(pc.hasActivePopup){
        return;
    }
    this.moveTarget(dt);
};

Chef.prototype.cook = function() {
    this.app.fire(this.cookEvent);
};

Chef.prototype.moveTarget = function(dt) {
    if(!this.target){
        return false;
    }

    var distance = this.entity.getPosition().sub(this.target.getPosition()).length();

    //set direction to target
    var position = this.entity.getPosition();
    var targetPosition = this.target.getPosition();

    this.nextDirection = Utils.lookAt(
        position.x, position.z, 
        targetPosition.x, targetPosition.z
    );

    this.direction = Utils.rotate(
        this.direction,
        this.nextDirection,
        this.turnSpeed * dt
    ); 

    if(distance > 0.1) {
        this.entity.translateLocal(
            Math.sin(this.direction) * this.speed * dt,
            0,
            Math.cos(this.direction) * this.speed * dt
        );

        this.characterEntity.anim.setBoolean('Walking', true);
    }else{
        this.characterEntity.anim.setBoolean('Walking', false);
    }

    this.modelEntity.setLocalEulerAngles(
        0, this.direction * pc.math.RAD_TO_DEG, 0
    );

    if(distance <= 0.1 && this.target){
        this.target = false;

        Timer.setTimeout(function(self){
            self.cook();
        }, 500, this);

        Timer.setTimeout(function(self){
            self.targetIndex++;

            if(self.targetIndex > self.targets.length - 1){
                self.targetIndex = 0;
            }

            self.target = self.targets[self.targetIndex];
        }, 1000, this);
    }
};