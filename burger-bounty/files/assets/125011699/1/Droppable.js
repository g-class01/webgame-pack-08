var Droppable = pc.createScript('droppable');

Droppable.attributes.add('accept', { type : 'string', default : 'Log' });
Droppable.attributes.add('icon', { type : 'asset' });
Droppable.attributes.add('placeIndex', { type : 'number' });
Droppable.attributes.add('maxItems', { type : 'number', default : 3 });

Droppable.attributes.add('dropType', { 
    type : 'string',
    enum : [
        {
            'Smoke' : 'Smoke'
        }
    ],
    default : 'Smoke'
});
Droppable.attributes.add('placeEntity', { type : 'entity' });
Droppable.attributes.add('completeEntity', { type : 'entity' });

Droppable.attributes.add('repeatItself', { type : 'boolean', default : false });
Droppable.attributes.add('type', { 
    type : 'string',
    enum : [
        { 'TimerBar' : 'TimerBar' },
        { 'Completable' : 'Completable' }
    ],
    default : 'Completable'
});

Droppable.attributes.add('fillUpTime', { type : 'number', default : 5 });

Droppable.prototype.initialize = function() {
    this.isBuilt  = false;
    this.isActive = false;

    if(this.completeEntity){
        this.completeEntity.enabled = false;
    }
    
    this.entity.on('Drop', this.onDrop, this);
    this.entity.on('Active', this.setActive, this);
    this.entity.on('Complete', this.setComplete, this);
    this.entity.on('Reset', this.setReset, this);
};

Droppable.prototype.setReset = function() {
    this.isBuilt  = false;
    this.isActive = true;

    this.placeIndex = 0;

    if(this.completeEntity){
        this.completeEntity.enabled = false;
    }

    this.clearPlaces();
};

Droppable.prototype.setActive = function() {
    this.isActive = true;
};

Droppable.prototype.setComplete = function() {
    if(this.completeEntity){
        this.completeEntity.enabled = true;
        //this.placeEntity.destroy();
    }

    this.isBuilt = true;
    this.setActive();
};

Droppable.prototype.onDrop = function(entity) {
    if(this.isBuilt){
        return false;
    }

    if(entity.name != this.accept){
        return false;
    }

    this.dropEffect();
    this.entity.fire('Station:Update');

    if(this.maxItems <= this.placeIndex && !this.completeEntity){
        this.clearPlaces();

        Timer.setTimeout(function(self){
            self.app.fire('Bank:Add', 200, self.entity);
        }, 1000, this);
    }

    if(
        !this.isBuilt &&
        this.completeEntity &&
        this.maxItems <= this.placeIndex
    ){
        Timer.setTimeout(function(self){
            self.build();
        }, 200, this);

        this.isBuilt = true;
    }
};

Droppable.prototype.clearPlaces = function() {
    var places = this.entity.findByTag('PlaceIndex');

    for(var index in places){
        var place = places[index];
        var collectables = place.findByTag('Collectable');

        if(collectables.length > 0){
            for(var collectableIndex in collectables){
                var collectable = collectables[collectableIndex];

                collectable.destroy();
            }
        }
    }

    this.placeIndex = 0;
};

Droppable.prototype.dropEffect = function() {
    if(this.dropType == 'Smoke'){
        this.app.fire('EffectManager:LandSmoke', this.entity.getPosition());
    }
};

Droppable.prototype.build = function() {
    this.setComplete();

    if(this.accept == 'Log'){
        this.app.fire('EffectManager:WoodDestroy', this.entity.getPosition());
    }

    this.app.fire('Motion', 'LittleShake');
    this.entity.fire('Station:Complete');
};