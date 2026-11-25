var Carry = pc.createScript('carry');

Carry.attributes.add('resetEntity', { type : 'entity' });
Carry.prototype.initialize = function() {
    this.isShowingBar = false;
    this.offset       = new pc.Vec3(0, 1, 0);

    this.takingThreshold = 0;
    this.lastDt = 0.1;

    this.who = false;
    this.entity.on('Trigger', this.onTrigger, this);
    this.entity.on('Leave', this.onLeave, this);

    this.on('destroy', this.onDestroy, this);

    this.app.fire('Scene:Triggers');
};

Carry.prototype.onDestroy = function() {
    this.onLeave();

    this.isColliding = false;
    this.app.fire('Scene:Triggers');
};

Carry.prototype.showTakingBar = function() {
    if(this.isShowingBar){
        return false;
    }

    /*
    this.app.fire(
        'Timeline:Taking@Loop', 
        true
    );
    */

    /*
    this.app.fire(
        'Timeline:Taking@Time', 
        0.5
    );
    */

    this.app.fire(
        'World2Screen:Show', 
        'TakeBar',
        this.entity,
        this.offset
    );

    this.isShowingBar = true;
};

Carry.prototype.onLeave = function() {
    this.app.fire(
        'World2Screen:Hide', 
        'TakeBar'
    );

    this.isColliding = false;
    this.isShowingBar = false;
    this.takingThreshold = 0;
};

Carry.prototype.onTrigger = function(entity) {
    this.isColliding = false;

    if(
        this.takingThreshold < 1.0 && 
        this.entity.tags.list().indexOf('WaitCarry') > -1
    ){
        this.isColliding = true;
        this.showTakingBar();

        return false;
    }

    if(Date.now() - entity.script.movement.lastCarryTime < 200){
        return false;
    }

    entity.script.movement.lastCarryTime = Date.now();

    var hasSpace = entity.script.carries.hasSpace();

    if(!hasSpace){
        if(entity.script.carries && !entity.script.carries.maxTextEntity.enabled){
            entity.script.carries.showMaxCapacity();
        }

        //this.app.fire('DealtDamage:Trigger', 'MAX', entity.getPosition());
        return false;
    }

    //this.app.fire('DealtDamage:Trigger', '+1', entity.getPosition());

    this.who = entity;
    this.who.fire('Carry', this.entity);
    this.entity.fire('Take', this.who);

    this.entity.reparent(this.who.script.carries.getAvailable());
    this.entity.ownerEntity = this.who;
    this.entity.setLocalEulerAngles(0, 0, 0);
    this.entity.setLocalPosition(0, 0, 0);

    this.entity.tags.remove('Trigger');
    this.entity.sound.play('Whoosh');
    this.entity.sound.play('Take');

    this.app.fire('Scene:Triggers');
    this.app.fire('EffectManager:LandSmoke', this.entity.getPosition());

    this.app.fire('Carry', this.entity.name);

    this.who.on('Drop', this.onDrop, this);

    if(this.resetEntity){
        this.resetEntity.fire('Reset');
    }

    entity.script.carries.updateCarries();

    this.app.fire(
        'World2Screen:Hide', 
        'TakeBar'
    );

    if(!entity.script.collisions.hasAnyCollision()){
        /*
        this.app.fire(
            'World2Screen:Hide', 
            'Bar'
        );
        */
    }
};

Carry.prototype.onDrop = function(name, connectedEntity) {
    if(!this.who){
        return false;
    }

    if(name && name != this.entity.name){
        return false;
    }

    if(Date.now() - this.who.script.movement.lastCarryTime < 200){
        return false;
    }
    
    this.app.fire('EffectManager:LandSmoke', this.entity.getPosition());

    if(connectedEntity){
        connectedEntity.fire('Drop', this.entity.name);
    }

    if(this.entity.sound){
        this.entity.sound.play('Drop');
        this.entity.sound.play('Whoosh');
    }

    this.entity.fire('Drop', this.who);

    this.who.off('Drop', this.onDrop, this);
    this.who.script.movement.lastCarryTime = Date.now();
    this.entity.destroy();

    if(!this.who.script.carries.hasAnyCarry()){
        this.who.fire('Carry', false);
    }

    this.who.script.carries.updateCarries();

    this.who = false;
};

Carry.prototype.update = function(dt) {
    if(
        this.isColliding &&
        this.takingThreshold < 1.0
    ){
        this.takingThreshold+=dt * 2.0;

        this.app.fire(
            'Bar:Taking', 
            this.takingThreshold
        );
    }
};