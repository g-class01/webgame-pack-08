var ItemSpawn = pc.createScript('itemSpawn');

ItemSpawn.attributes.add('entities', { type : 'entity', array : true });
ItemSpawn.prototype.initialize = function() {
    this.entities.forEach(function(entity){
        entity.enabled = false;
    });

    Timer.setTimeout(function(self){
        self.spawnItem();
    }, 500, this);
};

ItemSpawn.prototype.spawnItem = function() {
    var itemEntity = this.entities[0].clone();

    itemEntity.enabled = true;

    this.app.fire(
        'SplineMotion:Slide', 
        itemEntity
    );

    this.entity.addChild(itemEntity);
    this.app.fire('Scene:Collectables');

    //first spawn item
    if(!pc.firstSpawnItem){
        pc.firstSpawnItem = itemEntity;
    }

    Timer.setTimeout(function(self){
        self.spawnItem();
    }, 3000, this);
};