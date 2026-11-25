var UpgradeManager = pc.createScript('upgradeManager');

UpgradeManager.attributes.add('playerEntity', {
    type : 'entity'
});

UpgradeManager.attributes.add('outPosition', {
    type : 'entity'
});

UpgradeManager.attributes.add('popupEntity', {
    type : 'entity'
});

UpgradeManager.attributes.add('titleEntity', {
    type : 'entity'
});

UpgradeManager.attributes.add('moneyEntity', {
    type : 'entity'
});

UpgradeManager.attributes.add('imageEntity', {
    type : 'entity'
});

UpgradeManager.attributes.add('upgradePoint', {
    type : 'entity'
});

UpgradeManager.attributes.add('upgrades', {
    type : 'json',
    schema : [
        {
            name : 'title',
            type : 'string'
        },
        {
            name : 'money',
            type : 'number',
            default : 10
        },
        {
            name : 'entity',
            type : 'entity'
        },
        {
            name : 'station',
            type : 'entity'
        },
        {
            name : 'image',
            type : 'asset'
        }
    ],
    array : true
});
UpgradeManager.prototype.initialize = function() {
    this.createdAt = Date.now();
    this.index = -1;

    var currentIndex = Utils.getItem('UpgradeIndex');

    if(currentIndex && currentIndex > -1){
        this.index = currentIndex;
        this.unlockUntilIndex();
    }

    //this.upgradePoint.on('Trigger', this.onTrigger, this);

    this.app.on('UpgradeManager:Show', this.onShow, this);
    this.app.on('UpgradeManager:Details', this.showDetails, this);
    //this.app.on('UpgradeManager:Close', this.onClose, this);
    this.app.on('UpgradeManager:Unlock', this.unlock, this);
};

UpgradeManager.prototype.onShow = function(index) {
    var value = parseInt(index);

    var upgrade = this.getUpgrade(value);

    if(upgrade){
        upgrade.station.enabled = true;
    }
};

UpgradeManager.prototype.showDetails = function(index) {
    if(this.popupEntity.enabled){
        return false;
    }

    this.popupEntity.enabled = true;

    var upgrade = this.getUpgrade(index);

    //set title, image
    if(upgrade){
        this.titleEntity.element.text = upgrade.title;
        this.imageEntity.element.textureAsset = upgrade.image;

        this.moneyEntity.element.text = '$' + upgrade.money + '';
    }

    Timer.setTimeout(function(self){
        self.popupEntity.enabled = false;
    }, 5000, this);
};

UpgradeManager.prototype.onClose = function() {
    this.popupEntity.enabled = false;
    //this.upgradePoint.collision.enabled = true;

    this.playerEntity.setPosition(this.outPosition.getPosition().clone());
    this.playerEntity.script.movement.isLocked = false;
};

UpgradeManager.prototype.getUpgrade = function(index) {
     return this.upgrades[parseInt(index)];
};

UpgradeManager.prototype.unlock = function(value) {
    //unlock current index
    var upgrade = this.getUpgrade(value);

    if(upgrade && upgrade.entity && !upgrade.entity.enabled){
        upgrade.entity.enabled = true;
        //this.app.fire('UpgradeManager:Upgraded', upgrade.entity.name);

        //play sound
        this.entity.sound.play('Upgrade');
        this.app.fire('Camera:Focus', upgrade.entity);
        this.app.fire('EffectManager:Unlock', upgrade.entity.getPosition());

        if(Date.now() - this.createdAt > 5000){
            Timer.setTimeout(function(){
                pc.app.fire('Tutorial:Next');
            }, 3000, this);
        }

        //this.onClose();
        //this.upgradePoint.enabled = false;

        Utils.setItem('UpgradeIndex', this.index);

        this.index++;
    }
};

UpgradeManager.prototype.unlockUntilIndex = function(){
    for(var i = 0; i <= this.index; i++){
        upgrade = this.getUpgrade(i);

        if(upgrade && upgrade.entity){
            upgrade.entity.enabled = true;
            //this.app.fire('UpgradeManager:Upgraded', upgrade.entity.name);
        }
    }
};