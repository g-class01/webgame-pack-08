var Building = pc.createScript('building');

Building.attributes.add('buildingPlace', { type : 'entity' });
Building.attributes.add('carryPoint', { type : 'entity' });
Building.attributes.add('placeholderEntity', { type : 'entity' });
Building.attributes.add('edgeEntity', { type : 'entity' });
Building.attributes.add('placeEntity', { type : 'entity' });
Building.attributes.add('placeDownButton', { type : 'entity' });
Building.attributes.add('greenColor', { type : 'rgb' });
Building.attributes.add('redColor', { type : 'rgb' });
Building.attributes.add('branchUSA', { type : 'entity' });
Building.attributes.add('branchJapan', { type : 'entity' });
Building.attributes.add('shopItems', { type : 'entity', array : true });
Building.prototype.initialize = function() {
    this.guides = this.app.root.findByTag('Guide');
    
    this.currentBuilding = false;
    this.closerSnap = false;

    //disable all buildings
    this.buildings = this.app.root.findByTag('Placeable');
	this.buildings.forEach(function(building){
        building.enabled = false;
    });

    this.placedBuildings = [];

    var placedBuildings = Utils.getItem('PlacedBuildings');

    if(placedBuildings){
        this.placedBuildings = JSON.parse(placedBuildings);
    }

    this.placeBuildings();

    this.buildingPlace.enabled = false;
    this.placeholderEntity.enabled = false;

    this.resetShopItems();
    this.showGuides([]);

    this.app.on('Building:Place', this.setBuilding, this);
    this.app.on('Building:Build', this.build, this);
};

Building.prototype.getBuildingByName = function(name) {
    var entity;

    this.buildings.forEach(function(building) {
        if (building.name === name) {
            entity = building;
        }
    });

    return entity;
};

Building.prototype.setBuilding = function(name) {
    this.currentBuilding = this.getBuildingByName(name);

    if(this.currentBuilding){
        this.hoverEntity = this.currentBuilding.clone();
        this.hoverEntity.enabled = true;
        this.hoverEntity.setLocalPosition(0, 0, 0);
        this.carryPoint.addChild(this.hoverEntity);
        this.entity.fire('Carry', true);

        this.placeholderEntity.enabled = true;
        this.showGuides(this.hoverEntity.tags.list());

        this.placeDownButton.enabled = true;
    }else{
        if(this.hoverEntity){
            this.hoverEntity.destroy();
        }

        this.entity.fire('Carry', false);
        
        this.placeholderEntity.enabled = false;
        this.showGuides([]);

        this.placeDownButton.enabled = false;
    }
};

Building.prototype.showGuides = function(tags) {
    var i = this.guides.length;

    while(i--){
        var guide = this.guides[i];
        var guideTags = guide.tags.list();

        guide.enabled = false;

        for(var index in tags){
            var tag = tags[index];

            if(guideTags.indexOf(tag) > -1){
                guide.enabled = true;
            }
        }
	
    }
};

Building.prototype.snapToGuide = function() {
    var i = this.guides.length;

    this.closerSnap = false;

    if(!this.currentBuilding){
        return false;
    }

    while(i--){
        var guide = this.guides[i];

        if(guide.enabled === true){
            var distance = guide.getPosition().clone().sub(
                this.buildingPlace.getPosition()
            ).length();

            if(distance < 1.0){
                this.closerSnap = guide.getPosition();
            }
        }
    }
};

Building.prototype.resetShopItems = function() {
    var i = this.shopItems.length;

    while(i--){
        this.shopItems[i].fire('Reset');
    }
};

Building.prototype.build = function() {
    if(!this.currentBuilding){
        return false;
    }

    if(!this.closerSnap){
        this.app.fire('DealtDamage:Trigger', 'BLOCKED', this.entity.getPosition());
        return false;
    }

    this.removeCloserBuilding(this.closerSnap.clone());

    var building = this.currentBuilding.clone();
    building.setPosition(this.closerSnap.clone());
    building.enabled = true;

    var branchRoot = this['branch' + pc.CountryName];

    if(branchRoot){
        branchRoot.addChild(building);
    }else{
        this.app.root.addChild(building);
    }

    this.placedBuildings.push({
        name : building.name,
        branch : pc.CountryName ? pc.CountryName : '',
        position : this.closerSnap.clone()
    });

    this.app.fire('EffectManager:LandSmoke', this.closerSnap.clone());

    Utils.setItem('PlacedBuildings', JSON.stringify(this.placedBuildings));

    this.currentBuilding = false;
    this.placeholderEntity.enabled = false;

    this.resetShopItems();
    this.showGuides([]);
    this.entity.fire('Carry', false);

    this.placeDownButton.enabled = false;

    if(this.hoverEntity){
        this.hoverEntity.destroy();
    }

    this.app.fire('Building:Placed');
};

Building.prototype.removeCloserBuilding = function(position){
    var selectedPosition = false;
    var buildings = this.app.root.findByTag('Placeable');
    var i = buildings.length;

    while(i--){
        var building = buildings[i];

        if(building){
            var distance = building.getPosition().clone().sub(position).length();

            if(distance < 1.5){
                selectedPosition = building.getPosition().clone();
                building.destroy();
            }
        }
    }

    //also remove it from placedBuildings
	
    var j = this.placedBuildings.length;

    while(j--){
        var placedBuilding = this.placedBuildings[j];

        //check position by distance
	
        if(selectedPosition){
            var position = placedBuilding.position;
            var distance = new pc.Vec3(position.x, position.y, position.z).sub(selectedPosition).length();

            if(distance < 1.5){
                this.placedBuildings.splice(j, 1);
            }
        }
    }
};

Building.prototype.placeBuildings = function() {
    var i = this.placedBuildings.length;

    while(i--) {
        var name = this.placedBuildings[i].name;
        var position = this.placedBuildings[i].position;
        var branch = this.placedBuildings[i].branch;
        
        var building = this.getBuildingByName(name);

        if(building){
            building = building.clone();
            building.setPosition(position.x, position.y, position.z);
            building.enabled = true;

            if(branch){
                this['branch' + branch].addChild(building);
            }else{
                this['branchUSA'].addChild(building);
            }
        }
    }
};

Building.prototype.setKeyboard = function() {
    if(
        this.app.keyboard.wasPressed(pc.KEY_SPACE) ||
        this.app.keyboard.wasPressed(pc.KEY_ENTER)
    ){
        this.build();
    }
};

Building.prototype.updatePlaceholder = function() {
    this.snapToGuide();

    if(this.closerSnap){
        this.edgeEntity.element.color = this.greenColor;
        this.placeEntity.element.color = this.greenColor;

        this.placeholderEntity.setPosition(this.closerSnap);
    }else{
        this.edgeEntity.element.color = this.redColor;
        this.placeEntity.element.color = this.redColor;

        this.placeholderEntity.setPosition(this.buildingPlace.getPosition());
    }
};

Building.prototype.update = function(dt) {
    if(!this.currentBuilding){
        return false;
    }

    this.setKeyboard();
    this.updatePlaceholder();
};