var TimeUpgrade = pc.createScript('timeUpgrade');

TimeUpgrade.attributes.add('entitiesToUpdate', {
    type: 'entity',
    array: true,
    title: 'Entities to Update'
});

TimeUpgrade.attributes.add('barEntity', {
    type: 'entity',
    title: 'Bar Entity'
});

TimeUpgrade.attributes.add('stoveEntity', {
    type: 'entity'
});

TimeUpgrade.attributes.add('upgradeName', {
    type: 'string'
});

TimeUpgrade.prototype.initialize = function() {
    // loop through each entity in entitiesToUpdate array and set its station.time value
    for (var i = 0; i < this.entitiesToUpdate.length; i++) {
        this.entitiesToUpdate[i].script.station.time = 1; // set to desired value
    }
    
    // set the timeline.time value of the barEntity to desired value
    //this.barEntity.script.timeline.duration = 1;

    if(this.upgradeName){
        this.app.fire('Station:SetUpgrade', this.upgradeName, 3);
    }

    //update stove material, find it from assets material called "Palette-Lux
    this.stoveEntity.model.meshInstances[0].material = this.app.assets.find("Palette-Lux").resource;
};