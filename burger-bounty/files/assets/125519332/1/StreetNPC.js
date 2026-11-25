var StreetNpc = pc.createScript('streetNpc');

StreetNpc.attributes.add('speed', { type : 'number', default : 1 });
StreetNpc.attributes.add('characterEntity', { type : 'entity' });
StreetNpc.attributes.add('carEntity', { type : 'entity' });
StreetNpc.prototype.initialize = function() {
    this.createdAt = Date.now();
    //set local position randomly
    this.entity.translateLocal(pc.math.random(-1, 1), 0, pc.math.random(-1, 1));
    
    //set random model
    if(this.characterEntity){
        var modelName = 'USA-' + Math.round(pc.math.random(1, 5));
        var mesh = this.app.assets.find(modelName, 'render');
        var material = this.app.assets.find(modelName, pc.ASSET_MATERIAL);
        
        this.characterEntity.render.asset = mesh;
        this.characterEntity.render.materialAssets = [material];
    }else{
        this.carEntity.render.asset = this.app.assets.find('Car-' + Math.round(pc.math.random(1, 5)));
    }
};

StreetNpc.prototype.update = function(dt) {
    //Halt outside walkers/cars while a popup is open. translateLocal uses
    //dt and timeScale stays at 1 during popups, so without this gate they
    //keep sliding past the building under the menu. The Date.now-based
    //25s lifetime is also freed from real-time expiry.
    if(pc.hasActivePopup){
        return;
    }

    if(Date.now() - this.createdAt > 25000){
        this.entity.destroy();
    }

    this.entity.translateLocal(0, 0, this.speed * dt);
};