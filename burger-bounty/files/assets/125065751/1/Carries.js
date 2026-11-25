var Carries = pc.createScript('carries');

Carries.attributes.add('maxTextEntity', { type : 'entity' });
Carries.prototype.initialize = function() {
    this.carryPoints = this.entity.findByTag('CarryPoint');
    this.entity.on('Station:Upgrade', this.setUpgradeState, this);

    this.app.on('Player:ClearCarry', this.clearCarry, this);
};

Carries.prototype.setUpgradeState = function(level, multiplier) {
    var reverted = [...this.carryPoints].reverse();
    var i = reverted.length;

    while(i--){
        if(i < level){
            reverted[i].enabled = true;
        }
    }
};

Carries.prototype.showMaxCapacity = function() {
    this.app.fire('RewardManager:MaxCapacity');
    this.maxTextEntity.enabled = true;

    Timer.setTimeout(function(self){
        self.maxTextEntity.enabled = false;
    }, 2000, this);
};

Carries.prototype.getAvailable = function() {
    var i = this.carryPoints.length;

    while(i--){
        if (
            this.carryPoints[i].enabled && 
            this.carryPoints[i].children.length === 0
        ) {
            return this.carryPoints[i];
        }
    }

    return null;
};

Carries.prototype.hasAnyCarry = function() {
    for (var i = 0; i < this.carryPoints.length; i++) {
        if (
            this.carryPoints[i].enabled && 
            this.carryPoints[i].children.length > 0 &&
            this.carryPoints[i].children[0].name != 'Garbage'
        ) {
            return true;
        }
    }
};

Carries.prototype.hasSpace = function() {
    if(this.entity.script.building.currentBuilding){
        return false;
    }
    
    for (var i = 0; i < this.carryPoints.length; i++ ) {
        if (this.carryPoints[i].enabled && this.carryPoints[i].children.length === 0) {
            return true;
        }
    }
};

Carries.prototype.hasCarryByName = function(name) {
    for (var i = 0; i < this.carryPoints.length; i++ ) {
        if (this.carryPoints[i].enabled && this.carryPoints[i].children.length > 0) {
            if (this.carryPoints[i].children[0].name === name) {
                return true;
            }
        }
    }
};

Carries.prototype.hasCarryByNameAny = function(wants) {
    for (var i = 0; i < this.carryPoints.length; i++ ) {
        if (this.carryPoints[i].enabled && this.carryPoints[i].children.length > 0) {
            for(var index in wants){
                var want = wants[index];

                if (this.carryPoints[i].children[0].name === want.name) {
                    return want;
                }
            }
        }
    }
};

Carries.prototype.updateCarries = function() {
    //reparent object if there is another empty slot behind the current point
    var i = this.carryPoints.length;
    
    while(i--){
        if (
            this.carryPoints[i].children.length > 0 &&
            this.carryPoints[i].enabled
        ) {
            var nextPoint = this.carryPoints[i + 1];

            if (
                nextPoint && 
                nextPoint.enabled &&
                nextPoint.children.length === 0
            ) {
                this.carryPoints[i].children[0].reparent(nextPoint);
            }
        }
    }
};

Carries.prototype.clearCarry = function(){
    var i = this.carryPoints.length;
    
    while(i--){
        if (this.carryPoints[i].children.length > 0) {
            this.carryPoints[i].children[0].destroy();
        }
    }

    this.entity.fire('Carry', false);
};