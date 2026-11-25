var Door = pc.createScript('door');

Door.attributes.add('originEntity', { type : 'entity' });
Door.attributes.add('collisionEntity', { type : 'entity' });
Door.prototype.initialize = function() {
    this.lastPlayTime = -1;
    this.collisionEntity.on('Collision', this.onCollision, this);
};

Door.prototype.onCollision = function() {
    if(Date.now() - this.lastPlayTime > 1000){
        this.entity.sound.play('Slam');

        this.lastPlayTime = Date.now();
    }
};

Door.prototype.update = function(dt) {
    this.originEntity.lookAt(this.collisionEntity.getPosition());
};