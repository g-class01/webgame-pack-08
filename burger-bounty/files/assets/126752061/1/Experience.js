var Experience = pc.createScript('experience');

Experience.attributes.add('barEntity', { type : 'entity' });
Experience.attributes.add('iconEntity', { type : 'entity' });
Experience.attributes.add('insideIconEntity', { type : 'entity' });
Experience.attributes.add('levelTitleEntity', { type : 'entity' });
Experience.attributes.add('happyGroupEntity', { type : 'entity' });
Experience.attributes.add('happyBar', { type : 'entity' });
Experience.attributes.add('happyTextEntity', { type : 'entity' });
Experience.attributes.add('boostEffect', { type : 'entity' });
Experience.attributes.add('levels', { 
    type : 'json',
    schema : [
        {
            name : 'title',
            type : 'string',
            default : 'Unknown'
        },
        {
            name : 'nextCustomerCount',
            type : 'number',
            default : 1
        },
        {
            name : 'items',
            type : 'entity',
            array : true
        },
        {
            name : 'icon',
            type : 'asset'
        }
    ],
    array : true
});
Experience.prototype.initialize = function() {
    this.happyCount = Utils.getItemAsNumber('HappyCount');
    this.sadCount   = Utils.getItemAsNumber('SadCount');

    this.lastBoostEffectTime = Date.now();
    this.boostEffect.enabled = false;

    //set happy and sad

    this.currentIndex = Utils.getItemAsNumber('Level');
    this.currentRatio = 0;

    Timer.setTimeout(function(self){
        self.setLevel(true);
    }, 100, this);

    this.app.on('Customer:Vote', this.setCustomerVote, this);
};

Experience.prototype.setCustomerVote = function(state) {
    if(state == 'Happy'){
        this.happyCount++;
    }

    if(state == 'Sad'){
        /* Maybe?
        if(this.happyCount > 1){
            this.happyCount--;
        }
        */
        
        this.sadCount++;
    }

    if(this.happyCount >= this.nextHappyCount){
        //enable
        this.completeLevel();
    }

    this.happyTextEntity.element.text = this.happyCount + ' / ' + this.nextHappyCount;

    //save happy and sad count
    Utils.setItem('HappyCount', this.happyCount);
    Utils.setItem('SadCount', this.sadCount);

    this.app.fire('Timeline:Happy');
};

Experience.prototype.completeLevel = function() {
    var currentLevel = this.levels[this.currentIndex];

    if(!currentLevel){
        return false;
    }

    for(var i = 0; i < currentLevel.items.length; i++) {
        currentLevel.items[i].enabled = true;
    }

    this.app.fire('Camera:Focus', currentLevel.items[0], 3000);
    this.app.fire('Tutorial:Arrow', currentLevel.items[0]);

    //TODO, play level up sound here and play animation

    Timer.setTimeout(function(self){
        self.currentIndex++;
        self.setLevel();
    }, 1000, this);
};

Experience.prototype.setLevel = function(noReset) {
    var currentLevel = this.levels[this.currentIndex];

    if(!currentLevel){
        return false;
    }
    
    if(!noReset){
        this.happyCount = 0;   
    }

    this.nextHappyCount = currentLevel.nextCustomerCount;
    this.iconEntity.element.textureAsset = currentLevel.icon;
    this.insideIconEntity.element.textureAsset = currentLevel.icon;
    this.levelTitleEntity.element.text = currentLevel.title;

    this.happyTextEntity.element.text = this.happyCount + ' / ' + this.nextHappyCount;

    Utils.setItem('Level', this.currentIndex);

    if(noReset){
        //unlock everything until that level
        for(var i = 0; i < this.levels.length; i++) {
            if(i < this.currentIndex) {
                for(var j = 0; j < this.levels[i].items.length; j++) {
                    this.levels[i].items[j].enabled = true;
                }
            }
        }
    }
};

Experience.prototype.update = function(dt) {
    var ratio = (this.happyCount * 1 / this.nextHappyCount) + 0.01;

    if(this.currentRatio > ratio){
        this.currentRatio = ratio;
    }

    if(ratio > 0){
        this.currentRatio = pc.math.lerp(
            this.currentRatio,
            ratio,
            dt * 1
        );
    }

    this.currentRatio = Math.min(this.currentRatio, 1.0);

    this.happyBar.setLocalScale(this.currentRatio, 1, 1);
    this.happyGroupEntity.setLocalScale(1 / (this.currentRatio), 1, 1);

    if(Date.now() - this.lastBoostEffectTime > 1000 * 60 * 3){
        this.boostEffect.enabled = true;
        this.lastBoostEffectTime = Date.now();
    }

    this.insideIconEntity.fire('SetProgress', this.currentRatio);
};