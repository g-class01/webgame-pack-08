var DealtDamage = pc.createScript('dealtDamage');

DealtDamage.attributes.add('numberEntity', { type : 'entity' });
DealtDamage.attributes.add('holderEntity', { type : 'entity' });
DealtDamage.prototype.initialize = function() {
    this.numbers    = [];
    this.lastDamage = 100;
    this.defaultOffset = new pc.Vec3(0, 0.1, 0);

    this.isMinus = 1;
    
    this.cameraEntity = this.app.root.findByName('Lens');
    
    this.numberEntity.enabled = false;
    
    this.app.on('DealtDamage:Trigger', this.onDamageDealt, this);
    this.app.on('DealtDamage:Screen', this.onTextScreen, this);
};

DealtDamage.prototype.destroyEntity = function(number) {
    this.numbers.splice(this.numbers.indexOf(number), 1);
    number.destroy();
};

DealtDamage.prototype.onDamageDealt = function(
    number, position, isMinus
) {
    var numberEntity = this.numberEntity.clone();
    
    if(number > 0){
        numberEntity.element.text = Math.round(number) + '';
    }else{
        numberEntity.element.text = number;
    }
    
    /*
    if(offset){
        this.offset = offset;
    }else{
        this.offset = this.defaultOffset;
    }
    */
    this.offset = this.defaultOffset;
    
    numberEntity.player = new pc.Vec3(
        position.x,
        position.y,
        position.z
    );

    numberEntity.element.offsetX = Math.random() * 50 - Math.random() * 50;
    numberEntity.element.offsetY = -1.7;
    numberEntity.element.opacity = 1;
    
    var nextScale = 3;
    var duration = 0.3;
    
    this.isMinus = isMinus ? 1 : -1;
    this.lastDamage = number;
    
    //animations
    var scale = numberEntity.tween(
        numberEntity.getLocalScale()
    ).to({ x : nextScale, y : nextScale, z : nextScale }, 0.15, pc.BounceOut).delay(0.1);
    
    scale.on('complete', function(){
        this.entity.tween(
            this.entity.getLocalScale()
        ).to({ x : 1, y : 1, z : 1 }, 0.4, pc.BounceOut).start();
    });
    
    scale.start();
    
    var opacity = numberEntity.tween(
        numberEntity.element
    ).to({ offsetY : 0 }, 0.3, pc.Linear).start();
    
    opacity.on('complete', function(){
        numberEntity.tween(
            numberEntity.element
        ).to({ opacity : 0, offsetY : 0.8 }, duration, pc.Linear)
        .delay(1.0).start(); 
    });
    
    setTimeout(function(self, entity){
        self.destroyEntity(entity);
    }, 3000, this, numberEntity);
        
    this.numbers.push(numberEntity);
    this.holderEntity.addChild(numberEntity);

    //this.entity.sound.play('Hitmarker');
};

DealtDamage.prototype.onTextScreen = function(
    number, position, isMinus
) {
    var numberEntity = this.numberEntity.clone();
    
    if(number > 0){
        numberEntity.element.text = Math.round(number) + '';
    }else{
        numberEntity.element.text = number;
    }
    
    /*
    if(offset){
        this.offset = offset;
    }else{
        this.offset = this.defaultOffset;
    }
    */
    this.offset = this.defaultOffset;
    
    numberEntity.originalPosition = new pc.Vec3(
        position.x,
        position.y,
        position.z
    );

    numberEntity.element.offsetX = Math.random() * 1 - Math.random() * 1;
    numberEntity.element.offsetY = 0;
    numberEntity.element.opacity = 1;
    numberEntity.isScreenElement = true;
    
    var nextScale = 3;
    var duration = 0.3;
    
    this.isMinus = isMinus ? 1 : -1;
    this.lastDamage = number;
    
    //animations
    var scale = numberEntity.tween(
        numberEntity.getLocalScale()
    ).to({ x : nextScale, y : nextScale, z : nextScale }, 0.15, pc.BounceOut).delay(0.1);
    
    scale.on('complete', function(){
        this.entity.tween(
            this.entity.getLocalScale()
        ).to({ x : 1, y : 1, z : 1 }, 0.4, pc.BounceOut).start();
    });
    
    scale.start();
    
    var opacity = numberEntity.tween(
        numberEntity.element
    ).to({ offsetY : 0.25 }, 0.3, pc.Linear).start();
    
    opacity.on('complete', function(){
        numberEntity.tween(
            numberEntity.element
        ).to({ opacity : 0, offsetY : 0.8 }, duration, pc.Linear)
        .delay(1.0).start(); 
    });
    
    setTimeout(function(self, entity){
        self.destroyEntity(entity);
    }, 3000, this, numberEntity);
        
    this.numbers.push(numberEntity);
    this.holderEntity.addChild(numberEntity);

    //this.entity.sound.play('Hitmarker');
};

DealtDamage.prototype.updateNumberPosition = function(numberEntity){
    var screenPos = new pc.Vec3();
    var camera    = this.cameraEntity.camera;
    var ratio     = this.app.graphicsDevice.maxPixelRatio;
    
    var screenEntity = this.entity.screen;
    var scale  = screenEntity.scale;
    var device = this.app.graphicsDevice;

    if(numberEntity.isScreenElement){
        screenPos.x *= ratio;
        screenPos.y *= ratio;

        numberEntity.setLocalPosition(
            numberEntity.originalPosition.x + numberEntity.element.offsetX * 10.0,
            (device.height - screenPos.y) / scale - numberEntity.originalPosition.y + numberEntity.element.offsetY * 120,
            0
        );

        numberEntity.enabled = true;

        return false;
    }
    
    var headPosition = false;
    
    if(!numberEntity.player.name){
        headPosition = numberEntity.player;
    }else{
        headPosition = numberEntity.player.getPosition().clone().add(this.offset);
    }
    
    if(!camera){
        return false;
    }
    
    if(!numberEntity){
        return false;
    }
    
    camera.worldToScreen(headPosition, screenPos);
    
    screenPos.x *= ratio;
    screenPos.y *= ratio;
    
    if(
        screenPos.x > 0 && screenPos.x < this.app.graphicsDevice.width &&
        screenPos.y > 0 && screenPos.y < this.app.graphicsDevice.height &&
        screenPos.z > 0
    ){
        numberEntity.setLocalPosition(
            screenPos.x / scale + numberEntity.element.offsetX, 
            (device.height - screenPos.y) / scale + 
            this.isMinus * Math.cos(numberEntity.element.offsetY) * 
            Math.cos(numberEntity.element.offsetY) * 120 + (this.isMinus < 0 ? 150 : 0), 
            0
        );
        
        numberEntity.element.outlineThickness = numberEntity.element.opacity;
        numberEntity.enabled = true;
    }else{
        numberEntity.enabled = false;
    }  
};

DealtDamage.prototype.update = function(dt) {
    var i = this.numbers.length;
    
    while(i--){
        this.updateNumberPosition(this.numbers[i]);
    }
};