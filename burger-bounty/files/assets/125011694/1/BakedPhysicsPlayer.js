var BakedPhysicsPlayer = pc.createScript('bakedPhysicsPlayer');

BakedPhysicsPlayer.attributes.add('staticEntity', { type : 'entity' });
BakedPhysicsPlayer.attributes.add('speed', { type : 'number', default : 1 });
BakedPhysicsPlayer.attributes.add('autoplay', { type : 'boolean', default : false });
BakedPhysicsPlayer.attributes.add('file', { type : 'asset', assetType : 'json' });
BakedPhysicsPlayer.attributes.add('soundPlay', { 
    type : 'boolean'
});

BakedPhysicsPlayer.prototype.initialize = function() {
    this.staticEntity.on('Model:Loaded', this._onModelLoaded, this);
    
    this.on('destroy', this.onDestroy, this);
};

BakedPhysicsPlayer.prototype._onModelLoaded = function(state){
    if(state === true){
        this.onModelLoaded();
    }
};

BakedPhysicsPlayer.prototype.onModelLoaded = function(){
    var self = this;

    this.isPlaying = false;
    
    this.fps    = 60;
    this.pool   = [];
    this.data   = {};
    this.frames = [];
    this.frameIndex = 0;
    this.frameTime  = 0;
    
    this.isHidden   = false;
    this.childVertices = false;
    this.childScale    = false;
    
    this.app.assets.load(this.file);
    this.file.ready(function(data){
        var content = this.resources[0];
        
        self.data     = content;
        self.count    = content.count;
        self.duration = content.duration;
        self.frames   = content.frames;
        
        self.childVertices = content.childVertices;
        self.childScale    = content.childScale;

        //create physical objects
        self.createPhysicalObjects();
        self.hidePool();
        
        //console.log('[DEBUG] Baked Physics Loaded', self.frames);
    });
    
    //prepare for load
    this.staticEntity.enabled = false;
    
    this.app.on('BakedPhysics:' + this.entity.name, this.onPlay, this);
    
    if(this.autoplay){
        this.app.fire('BakedPhysics:' + this.entity.name, new pc.Vec3(0, 0, 0));
    }
};

BakedPhysicsPlayer.prototype.onDestroy = function() {
    this.app.off('BakedPhysics:' + this.entity.name, this.onPlay, this);
};

BakedPhysicsPlayer.prototype.onPlay = function(position) {
    this.isPlaying  = true;
    this.isHidden   = false;
    
    this.isEnded    = false;
    
    this.frameIndex = 0;
    this.frameTime  = 0;
    
    if(position){
        this.entity.setLocalPosition(position);
    }
    
    this.showPool();

    if(this.soundPlay){
        this.entity.sound.play('Sound');
    }
};

BakedPhysicsPlayer.prototype.createPhysicalObjects = function() {
    if(this.data.childVertices){
        var meshInstances = this.staticEntity.model.meshInstances;
        
        for(var index in meshInstances){
            var instance = meshInstances[index];
            
            if(parseInt(index) > -1){
                instance.triggered = false;
                instance.isLarge   = instance.node.name.search('Large') > -1;
                
                this.pool.push(instance);   
            }
        }
    }else{
        for(var i = 0; i < this.count; i++){
            var staticEntity = this.staticEntity.clone();
                staticEntity.enabled = true;

            this.pool.push(staticEntity);
            this.entity.addChild(staticEntity);
        }
    }
};

BakedPhysicsPlayer.prototype.showPool = function(dt) {
    if(this.childVertices){
        this.staticEntity.enabled = true;
    }else{
        var i = this.pool.length;
    
        while(i--){
            this.pool[i].enabled = true;
        }
    }

    this.staticEntity.enabled = true;
};

BakedPhysicsPlayer.prototype.hidePool = function(dt) {
    if(this.isHidden){
        return false;    
    }
    
    if(this.childVertices){
        var i = this.pool.length;

        while(i--){
            this.pool[i].triggered = false;
            this.pool[i].enabled   = false;
        }
    }else{    
        this.staticEntity.enabled = false;
    }

    this.staticEntity.enabled = false;
    
    this.isHidden = true;
};

BakedPhysicsPlayer.prototype.onEnd = function() {
    if(this.isEnded){
        return false;
    }
    

    this.isEnded = true;
};

BakedPhysicsPlayer.prototype.getRadius = function(vector){
    return vector.x + vector.y + vector.z;  
};

BakedPhysicsPlayer.prototype.update = function(dt) {
    if(!this.isPlaying){
        return false;
    }
    
    if(this.frames.length === 0){
        return false;
    }
    
    if(this.frames.length - 1 < this.frameIndex){
        this.isPlaying = false;
        
        this.hidePool();
        this.onEnd();
        
        return false;
    }
    
    var i = this.pool.length;
    
    while(i--){
        var frame     = this.frames[this.frameIndex][i];
        var transform = frame;
        var index     = frame[0];
        
        if(this.childVertices){
            this.pool[index].node.setLocalPosition(
                transform[1] * 100, transform[2] * 100, transform[3] * 100
            );
            
            this.pool[index].node.setLocalEulerAngles(
                transform[4], transform[5], transform[6]
            );
        }else{
            this.pool[index].setLocalPosition(
                transform[1], transform[2], transform[3]
            );
            
            this.pool[index].setLocalEulerAngles(
                transform[4], transform[5], transform[6]
            );
        }
        
        if(this.groundTrigger){
            var position = this.pool[index].node.getPosition().clone();
            
            if(
                !this.pool[index].triggered &&
                this.pool[index].isLarge &&
                position.y < 0
            ){
                this.pool[index].triggered = true;
            }
        }
    }
    
    this.frameTime+=dt * this.fps * this.speed;
    this.frameIndex = Math.round(this.frameTime);
};