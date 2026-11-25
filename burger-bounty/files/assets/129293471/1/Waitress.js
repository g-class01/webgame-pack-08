var Waitress = pc.createScript('waitress');

Waitress.attributes.add('sinkEntity', { type : 'entity' });
Waitress.attributes.add('plateEntity', { type : 'entity' });
Waitress.attributes.add('characterEntity', { type : 'entity' });

Waitress.prototype.initialize = function() {
    this.isCollecting = false;
    this.lastCheck = Date.now();

    this.originalSpeed = parseFloat('' + this.entity.script.pathMove.speed);

    this.entity.on('Waypoint:Reach', this.onWayPoint, this);
    this.entity.on('Station:Upgrade', this.setUpgradeState, this);
};

Waitress.prototype.setUpgradeState = function(level, multiplier) {
    this.entity.script.pathMove.speed = Math.min(this.originalSpeed * multiplier, 0.075);
};

Waitress.prototype.onDirtyPlate = function(dirtyPlate) {
    if(this.isCollecting){
        return false;
    }

    this.entity.fire('Waypoint:Target', dirtyPlate);
    this.isCollecting = true;
};

Waitress.prototype.onWayPoint = function(target) {
    if(target.name == 'DirtyPlate'){
        this.plateEntity.enabled = true;
        this.characterEntity.anim.setBoolean('Carry', true);

        //'Carry'
        if(target.ownerEntity){
            target.ownerEntity.fire('Carry', false);
        }
        
        Timer.setTimeout(function(self){
            self.entity.fire('Waypoint:Target', self.sinkEntity);
            target.fire('Take');
            target.destroy();
        }, 500, this);
    }
    
    if(target.name == 'Sink'){
        this.plateEntity.enabled = false;
        this.characterEntity.anim.setBoolean('Carry', false);
        this.isCollecting = false;
    }
};

Waitress.prototype.checkDirtyPlates = function() {
    if(Date.now() - this.lastCheck > 1000){
        var plates = this.app.root.findByTag('DirtyPlate');

        //filter only enabled ones
        plates = plates.filter(function(plate){
            return plate.enabled;
        });

        if(plates.length > 0){
            this.onDirtyPlate(plates[0]);
        }

	    this.lastCheck = Date.now();
    }
};

Waitress.prototype.update = function(dt) {
    //Halt dirty-plate scan while a popup is open so the waitress doesn't
    //keep dispatching collect routes under the menu.
    if(pc.hasActivePopup){
        return;
    }
    this.checkDirtyPlates();
};