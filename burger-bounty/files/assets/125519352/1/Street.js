var Street = pc.createScript('street');

Street.attributes.add('stuff', { type : 'entity', array : true });
Street.attributes.add('time', { type : 'number', default : 1 });
Street.prototype.initialize = function() {
    this.lastSpawnTime = Date.now();
};

Street.prototype.update = function(dt) {
    //Halt the street-spawn loop while a popup is open: Date.now is
    //real-time and would keep minting walkers/cars that then slide along
    //(StreetNPC is gated too, but stopping spawns avoids a pile-up the
    //moment the popup closes).
    if(pc.hasActivePopup){
        return;
    }

    if(Date.now() - this.lastSpawnTime > this.time * 1000){
        this.spawn();
    }
};

Street.prototype.spawn = function() {
    var stuff  = this.stuff[Math.floor(Math.random() * this.stuff.length)];
    var entity = stuff.clone();

    entity.enabled = true;

    this.entity.addChild(entity);
    this.lastSpawnTime = Date.now();
};
