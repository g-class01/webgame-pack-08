var Kinematic = pc.createScript('kinematic');

Kinematic.attributes.add('state', { type : 'boolean', default : true });
Kinematic.prototype.initialize = function() {
    this.isActive = false;

    this.entity.on('Activate', this.setActivate, this);
    this.entity.on('Deactivate', this.setDeactivate, this);

    this.entity.on('ApplyForce', this.applyForce, this);

    if(this.state){
        this.setActivate();
    }
};

Kinematic.prototype.applyForce = function(vector) {
    this.entity.translateLocal(vector);
};

Kinematic.prototype.setActivate = function() {
    if(this.isActive){
        return false;
    }

    this.entity.tags.add('Kinematic');
    this.app.fire('Scene:Collision');
    this.isActive = true;
};

Kinematic.prototype.setDeactivate = function() {
    if(!this.isActive){
        return false;
    }
    
    this.entity.tags.remove('Kinematic');
    this.app.fire('Scene:Collision');
    this.isActive = false;
};