var Waypoint = pc.createScript('waypoint');

Waypoint.attributes.add('target', { type : 'entity' });
Waypoint.attributes.add('baseTarget', { type : 'entity' });
Waypoint.attributes.add('characterEntity', { type : 'entity' });
Waypoint.prototype.initialize = function() {
    this.entity.on('Waypoint:Target', this.setNewTarget, this);
    this.entity.on('Path:State', this.setWalking, this);
};

Waypoint.prototype.setNewTarget = function(target) {
    var self = this;

    //check target distance is it close to same point?
    if(this.target){
        var distance = this.target.getPosition().clone().sub(target).length();

        if (distance < 0.1) {
            console.log('an issue here');
            return false;
        }
    }

    //console.log(target);
    
    this.app.fire(
        'PathFinding:Find', 
        this.entity.getPosition(), 
        target.getPosition(), 
        function(path){
            self.entity.fire('Path:Move', path);
        }
    );

    this.target = target;
};

Waypoint.prototype.setWalking = function(state) {
    this.characterEntity.anim.setBoolean('Walking', state);
};

Waypoint.prototype.update = function(dt) {
    if(this.target){
        if(this.target && this.target.ownerEntity){
            this.setNewTarget(this.baseTarget);
            return false;
            
        }

        var distance = this.entity.getPosition().distance(this.target.getPosition());

        if (distance < 1.5) {
            this.entity.fire('Waypoint:Reach', this.target);
            this.setWalking(false);
        }
    }else{
        this.setWalking(false);
    }
};