var KitchenManager = pc.createScript('kitchenManager');

KitchenManager.attributes.add('parentEntity', { type: 'entity' });
KitchenManager.attributes.add('foods', {type: 'entity', array : true});
KitchenManager.attributes.add('stations', {type: 'entity', array : true});
KitchenManager.attributes.add('assistants', {type: 'entity', array : true});
KitchenManager.attributes.add('placePointsBurger', {type: 'entity', array : true });
KitchenManager.attributes.add('placePointsFries', {type: 'entity', array : true });
KitchenManager.attributes.add('placePointsSushi', {type: 'entity', array : true });
KitchenManager.attributes.add('placePointsRamen', {type: 'entity', array : true });
KitchenManager.attributes.add('placePointsPizzaCheese', {type: 'entity', array : true });
KitchenManager.attributes.add('placePointsPizzaMozzarella', {type: 'entity', array : true });
KitchenManager.attributes.add('placePointsCoke', {type: 'entity', array : true });
KitchenManager.attributes.add('placePointsIceCream', {type: 'entity', array : true });

KitchenManager.attributes.add('dirtyPlate', {type: 'entity'});
KitchenManager.attributes.add('garbage', {type: 'entity'});
KitchenManager.attributes.add('playerEntity', {type: 'entity'});

KitchenManager.prototype.initialize = function() {
    this.cookIndex = 0;
    this.counts = {
        'Burger' : 3,
        'Fries'  : 3,
        'Coke'   : 3,
        'Sushi'  : 3,
        'Ramen'  : 3,
        'PizzaCheese' : 3,
        'PizzaMozzarella' : 3
    };

    this.lastGarbageTime = Date.now();

    //disable all foods
    for(var i = 0; i < this.foods.length; i++) {
        this.foods[i].enabled = false;
    }

    //disable all foods
    for(var i = 0; i < this.assistants.length; i++) {
        this.assistants[i].enabled = false;
    }

    this.onStateChange(true);
    this.on('state', this.onStateChange, this);
    this.on('destroy', this.onDestroy, this);
};

KitchenManager.prototype.onStateChange = function(state) {
    if(state === true){
        this.app.on('Kitchen:Create', this.create, this);
        this.app.on('Kitchen:GhostCreate', this.ghostCreate, this);
        this.app.on('Kitchen:ChefCook', this.chefCook, this);
        this.app.on('Kitchen:Open', this.open, this);
        this.app.on('Kitchen:Assistant', this.hire, this);
        this.app.on('Kitchen:DirtyPlate', this.createDirtyPlate, this);
        this.app.on('Kitchen:Upgrade', this.upgrade, this);
        this.app.on('Kitchen:HasSpace', this.hasSpace, this);
    }else{
        this.app.off('Kitchen:Create', this.create, this);
        this.app.off('Kitchen:GhostCreate', this.ghostCreate, this);
        this.app.off('Kitchen:ChefCook', this.chefCook, this);
        this.app.off('Kitchen:Open', this.open, this);
        this.app.off('Kitchen:Assistant', this.hire, this);
        this.app.off('Kitchen:DirtyPlate', this.createDirtyPlate, this);
        this.app.off('Kitchen:Upgrade', this.upgrade, this);
        this.app.off('Kitchen:HasSpace', this.hasSpace, this);
    }
};

KitchenManager.prototype.onDestroy = function() {
    this.onStateChange(false);
};

KitchenManager.prototype.upgrade = function(key, value) {
    //5 is next upgrade always
    this.counts[key] = value;
};

KitchenManager.prototype.createDirtyPlate = function(table) {
    var dirtyPlate = this.dirtyPlate.clone();

    dirtyPlate.enabled = true;
    dirtyPlate.setPosition(
        table.entity.getPosition().clone().add(new pc.Vec3(0, 0.85, 0))
    );
    
    dirtyPlate.on('Take', function(){
        table.isDirty = false;
    });

    this.parentEntity.addChild(dirtyPlate);
    this.app.fire('DirtyPlate:Created', dirtyPlate);
};

KitchenManager.prototype.open = function(name) {
    //enable station by name
    for(var i = 0; i < this.stations.length; i++ ) {
        if(this.stations[i].name === name) {
            this.stations[i].enabled = true;
            this.app.fire('EffectManager:Unlock', this.stations[i].getPosition());

            this.app.fire('Light:Render');
        }
    }
};

KitchenManager.prototype.hire = function(name) {
    //enable station by name
    for(var i = 0; i < this.assistants.length; i++ ) {
        if(this.assistants[i].name === name) {
            this.assistants[i].enabled = true;
            this.app.fire('EffectManager:Unlock', this.assistants[i].getPosition());
            this.app.fire('Scene:Collision');

            this.app.fire('Camera:Focus', this.assistants[i]);
        }
    }
};

KitchenManager.prototype.getFoodCount = function(name) {
    //get entities by Food tag with the same name
    var foodEntities = this.parentEntity.findByTag('Collect');
    var count = 0;

    for(var i = 0; i < foodEntities.length; i++ ) {
        if(foodEntities[i].name === name && foodEntities[i].enabled && !foodEntities[i].script.carry.who) {
            count++;
        }
    }

    return count;
};

KitchenManager.prototype.hasSpace = function(value, callback, fail) {
    var count = this.totalFoodCountByName(value);

    //this part will be updated for specific foods, upgrades will be involved
    if(count < this.counts[value]){
        callback();
    }else{
        fail();
    }
};

KitchenManager.prototype.totalFoodCount = function() {
    //get entities by Food tag with the same name
    var foodEntities = this.parentEntity.findByTag('Food');
    var count = 0;

    for(var i = 0; i < foodEntities.length; i++ ) {
        if(foodEntities[i].enabled) {
            count++;
        }
    }

    return count;
};

KitchenManager.prototype.totalFoodCountByName = function(name) {
    //get entities by Food tag with the same name
    var foodEntities = this.parentEntity.findByTag('Food');
    var count = 0;

    for(var i = 0; i < foodEntities.length; i++ ) {
        if(foodEntities[i].enabled && foodEntities[i].name == name && !foodEntities[i].script.carry.who) {
            count++;
        }
    }

    return count;
};

KitchenManager.prototype.ghostCreate = function(name) {
    this.create(name, true);
};

KitchenManager.prototype.hasStation = function(name) {
    for(var i = 0; i < this.stations.length; i++ ) {
        if(this.stations[i].name === name && this.stations[i].enabled) {
            return true;
        }
    }

    return false;
};

KitchenManager.prototype.chefCook = function(){
    if(this.cookIndex === 1){
        this.create('Burger', true);
    }else if(this.cookIndex === 0){
        if(this.hasStation('Fries')){
            this.create('Fries', true);
        }else{
            this.create('Burger', true);
        }
    }

    this.cookIndex++;

    if(this.cookIndex > 1){
        this.cookIndex = 0;
    }
};

KitchenManager.prototype.getAvailablePlacePoint = function(type){
    var length = this['placePoints' + type].length;

    for(var i = 0; i <= length; i++){
        var placePoint = this['placePoints' + type][i];

        if(
            placePoint && 
            placePoint.enabled === true && 
            placePoint.children.length === 0
        ){
            return placePoint;
        }
    }
};

KitchenManager.prototype.create = function(name, isGhost) {
    if(
        this.getFoodCount(name) >= this.counts[name]
    ){
        return false;
    }

    //specific case
    if(
        name == 'Coke' ||
        name == 'IceCream'
    ){
        if(!this.playerEntity.script.carries.hasSpace()){
            this.playerEntity.script.carries.showMaxCapacity();
            return false;
        }
    }

    //clone food entity
    var food = this.foods.find(function(food) {
        return food.name === name;
    });

    if(!food){
        return false;
    }

    var foodEntity = food.clone();
    var foodCount  = this.totalFoodCount();

    foodEntity.enabled = true;

    if(name == 'Burger'){
        foodEntity.setLocalPosition(0, 0, 0);

        if(!isGhost){
            this.app.fire('Camera:Offset', new pc.Vec3(0.1, 0, -0.15));
        }

        this.app.fire('Throw', 'Burger', 750);

        Timer.setTimeout(function(self){
            var placePoint = self.getAvailablePlacePoint('Burger');

            if(placePoint){
                placePoint.addChild(foodEntity);
            }
        }, 750, this);
    }else{
        foodEntity.setLocalPosition(0, 0, 0);

        var placePoint = this.getAvailablePlacePoint(name);

        if(placePoint){
            placePoint.addChild(foodEntity);
        }
    }
    
    if(!isGhost){
        this.app.fire('Motion', 'LittleShake');
    }
};

KitchenManager.prototype.getAvailableOptions = function(){
    var output = [];

    for(var index in this.stations){
        var station = this.stations[index];

        if(station.enabled){
            output.push(station.name);
        }
    }

    return output;
};

KitchenManager.prototype.updateGarbage = function(){
    if(Date.now() - this.lastGarbageTime > 1000 * 60 * 5){
        //make it so if is there any entity with Garbage tag, return false
        var hasGarbage = this.parentEntity.findByTag('GarbageBag').length > 0;

        if(hasGarbage){
            return false;
        }

        var garbage  = this.garbage.clone();
        var position = this.garbage.getPosition().clone();

        garbage.setPosition(
            position.x + (Math.random() - Math.random()) * 0.5, 
            0, 
            position.z + (Math.random() - Math.random()) * 0.5
        );

        garbage.enabled = true;

        this.parentEntity.addChild(garbage);
        this.lastGarbageTime = Date.now();
    }
};

KitchenManager.prototype.update = function(){
    this.updateGarbage();
};