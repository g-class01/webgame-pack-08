var Overlay = pc.createScript('overlay');

Overlay.attributes.add('rewardHolder', { type : 'entity' });
Overlay.attributes.add('rewardEntity', { type : 'entity' });
Overlay.attributes.add('popupEntity', { type : 'entity' });
Overlay.attributes.add('characterEntity', { type : 'entity' });
Overlay.attributes.add('playerEntity', { type : 'entity' });
Overlay.attributes.add('cameraBaseEntity', { type : 'entity' });
Overlay.attributes.add('wantBar', { type : 'entity' });
Overlay.attributes.add('orderHolder', { type : 'entity' });
Overlay.attributes.add('cookBar', { type : 'entity' });
Overlay.attributes.add('takeBar', { type : 'entity' });
Overlay.attributes.add('useArrowsEntity', { type : 'entity' });
Overlay.attributes.add('useTouchEntity', { type : 'entity' });
Overlay.attributes.add('bottomShadowEntity', { type : 'entity' });
Overlay.attributes.add('moneyEntity', { type : 'entity' });
Overlay.attributes.add('gameControlsEntity', { type : 'entity' });
Overlay.attributes.add('newMapEntity', { type : 'entity' });

Overlay.attributes.add('otherCafesEntity', { type : 'entity' });
Overlay.attributes.add('countryPopup', { type : 'entity' });
Overlay.attributes.add('countryTitle', { type : 'entity' });
Overlay.attributes.add('countryThumbnail', { type : 'entity' });
Overlay.attributes.add('countryComingSoon', { type : 'entity' });
Overlay.attributes.add('switchButton', { type : 'entity' });
Overlay.attributes.add('buyButton', { type : 'entity' });
Overlay.attributes.add('buyPrice', { type : 'entity' });
Overlay.attributes.add('rewardBuyButton', { type : 'entity' });

Overlay.attributes.add('indicatorArrow', { type : 'entity' });
Overlay.attributes.add('tutorialArrow', { type : 'entity' });

Overlay.attributes.add('dailyRewardPopup', { type : 'entity' });
Overlay.attributes.add('dailyRewardTimeEntity', { type : 'entity' });

Overlay.attributes.add('upgradePopup', { type : 'entity' });
Overlay.attributes.add('pauseEntity', { type : 'entity' });
Overlay.attributes.add('designPopup', { type : 'entity' });
Overlay.attributes.add('designHolder', { type : 'entity' });
Overlay.attributes.add('designItem', { type : 'entity' });
Overlay.attributes.add('designItems', { 
    type : 'json',
    schema : [
        {
            name : 'name',
            type : 'string'
        },
        {
            name : 'type',
            type : 'string',
            enum : [
                { 'Props' : 'Props' },
                { 'Floor' : 'Floor' },
                { 'Wall' : 'Wall' }
            ],
            default : 'Props'
        },
        {
            name : 'price',
            type : 'number'
        }
    ],
    array : true
});

Overlay.prototype.initialize = function() {
    this.indicatorTimer = 0;
    this.isPlacing = false;
    this.lastOfferTime = -1;

    this.designItemsArray = [];

    if(Utils.isMobile()){
        this.rewardEntity.setLocalScale(2.28, 2.28, 2.28);

        //center popup entity, hide preview
        this.popupEntity.setLocalPosition(0, 0, 0);
        this.characterEntity.enabled = false;

        //make want bigger
        this.wantBar.script.timeline.endFrame.scale.x = 2;
        this.wantBar.script.timeline.endFrame.scale.y = 2;
        this.wantBar.script.timeline.endFrame.scale.z = 2;

        this.orderHolder.setLocalScale(0.671, 0.671, 0.671);
        this.orderHolder.setLocalPosition(0, -80, 0);
        
        this.rewardHolder.script.timeline.endFrame.position.y = 200;

        //this.waitBar.setLocalScale(1.5, 1.5, 1.5);

        this.otherCafesEntity.setLocalScale(1.636, 1.636, 1.636);
        
        this.cookBar.script.timeline.endFrame.scale.x = 1.5;
        this.cookBar.script.timeline.endFrame.scale.y = 1.5;
        this.cookBar.script.timeline.endFrame.scale.z = 1.5;

        this.takeBar.script.timeline.endFrame.scale.x = 1.5;
        this.takeBar.script.timeline.endFrame.scale.y = 1.5;
        this.takeBar.script.timeline.endFrame.scale.z = 1.5;

        this.useArrowsEntity.enabled = false;
        this.useTouchEntity.enabled  = true;

        //we need a tint for the bottom
        this.bottomShadowEntity.enabled = true;

        //make money entity bigger
        this.moneyEntity.setLocalScale(1.4, 1.4, 1.4);

        //make game controls bigger
        this.gameControlsEntity.setLocalScale(1.4, 1.4, 1.4);
    }else{
        this.useTouchEntity.enabled = false;
    }

    if(Utils.isIOS()){
        this.useArrowsEntity.enabled = false;
        this.useTouchEntity.enabled  = true;
    }

    if(Utils.getItem('DailyReward')){
        this.lastDailyReward = parseInt(Utils.getItem('DailyReward'));
    }else if(Utils.getItem('TutorialIndex')){
        this.lastDailyReward = -1;
    }

    /*if(
        this.lastDailyReward != -1 &&
        Date.now() - this.lastDailyReward > 1000 * 60 * 60
    ){
        this.showDailyRewardPopup();
    }*/

    if(this.lastDailyReward === -1){
        Utils.setItem('DailyReward', Date.now());
    }

    this.app.on('Country:Switch', this.showCountryPopup, this);

    this.app.on('Design:Show', this.showDesignPopup, this);
    this.app.on('Design:Buy', this.buyDesign, this);
    this.app.on('Design:Filter', this.filterDesignItems, this);

    this.app.on('DailyReward:Claim', this.claimDailyReward, this);

    this.app.on('Upgrade:Show', this.showUpgradePopup, this);

    this.app.on('Building:Placed', this.onPlace, this);
    this.app.on('Gameplay:PlayAction', this.onPlayAction, this);
    this.app.on('Gameplay:Play', this.onPlay, this);
    this.app.on('Gameplay:Pause', this.onPause, this);

    this.app.on('Overlay:OpenLink', this.onOpenLink, this);
    this.app.on('Reset:All', this.reset, this);

    this.filterDesignItems('Props');

    if(Utils.getItem('FirstLogin')){
        setTimeout(function(self){
            self.newMapEntity.enabled = true;
        }, 1000 * 10, this);
    }else{
        setTimeout(function(self){
            self.newMapEntity.enabled = true;
        }, 1000 * 60 * 5, this);
    }
};

Overlay.prototype.onOpenLink = function(link){
    window.open(link, '_blank');
};

Overlay.prototype.reset = function() {
    if(this.popupEntity) this.popupEntity.enabled = false;
    if(this.dailyRewardPopup) this.dailyRewardPopup.enabled = false;
    if(this.upgradePopup) this.upgradePopup.enabled = false;
    if(this.designPopup) this.designPopup.enabled = false;
    if(this.countryPopup) this.countryPopup.enabled = false;
    if(this.pauseEntity) this.pauseEntity.enabled = false;
    if(this.newMapEntity) this.newMapEntity.enabled = false;

    this.isPlacing = false;
    this.lastOfferTime = -1;
    this.lastDailyReward = -1;

    if(this.playerEntity && this.playerEntity.script && this.playerEntity.script.movement){
        this.playerEntity.script.movement.isLocked = false;
    }

    //clear popup-tracking state — every popup just got disabled by the resets above
    pc.hasActivePopup = false;
};

Overlay.prototype.onPlayAction = function() {
    PokiPlugin.playGame();
};

Overlay.prototype.onPlay = function() {
    this.pauseEntity.enabled = false;
};

Overlay.prototype.onPause = function() {
    this.pauseEntity.enabled = true;
};

Overlay.prototype.showUpgradePopup = function() {
    this.upgradePopup.enabled = true;
    this.app.fire('Popup:Open', this.playerEntity);
};

Overlay.prototype.showDailyRewardPopup = function() {
    this.dailyRewardPopup.enabled = true;
    this.dailyRewardTime = 60 * 60 * 24;
    this.app.fire('Popup:Open', this.playerEntity);
};

Overlay.prototype.claimDailyReward = function() {
    Utils.setItem('DailyReward', Date.now());

    this.app.fire('RewardManager:Get', 250);
    this.app.fire('Popup:Hide', 'DailyReward');

    Utils.logCheckpoint('daily_reward');
};

Overlay.prototype.onPlace = function() {
    this.isPlacing = false;
};

Overlay.prototype.filterDesignItems = function(name) {
    //clear this.designItemsArray
	var i = this.designItemsArray.length;

    while(i--){
        this.designItemsArray[i].destroy();
    }

    this.designItemsArray = [];

    //add all design items with cloning designItem into designHolder
	for (var i = 0; i < this.designItems.length; i++) {
        if(name != this.designItems[i].type){
            continue;
        }

        var designItem = this.designItem.clone();

        designItem.enabled = true;
        designItem.script.button.value = this.designItems[i].name;
        designItem.findByName('Name').element.text = this.designItems[i].name;
        designItem.findByName('Price').element.text = '$' + this.designItems[i].price;
        designItem.findByName('Icon').element.textureAsset = this.app.assets.find(this.designItems[i].name + '-Icon.png');

        this.designHolder.addChild(designItem);
        this.designItemsArray.push(designItem);
    }
};

Overlay.prototype.isBranchUnlocked = function(country){
    if(country == 'USA'){
        return true;
    }else{
        return Utils.getItem('Branch_' + country) == 'Unlocked';
    }
};

Overlay.prototype.showCountryPopup = function(country) {
    this.countryPopup.enabled = true;
    this.countryTitle.element.text = country;
    this.countryThumbnail.element.textureAsset = this.app.assets.find('Location-' + country + '.jpg');

    //USA is the first one, automatically always unlocked
    var isUnlocked = this.isBranchUnlocked(country);

    if(isUnlocked){
        this.countryComingSoon.enabled = false;
        this.buyButton.enabled = false;
        this.rewardBuyButton.enabled = false;

        this.switchButton.enabled = true;
    }else{
        this.countryComingSoon.enabled = false;
        this.buyButton.enabled = true;
        this.rewardBuyButton.enabled = true;

        this.switchButton.enabled = false;

        var branchPrices = this.app.root.findByName('BranchManager').script.branchManager.branchPrices;

        var price;
        if(country == 'Japan'){
            price = branchPrices[0];
        } else if (country == 'Italy'){
            price = branchPrices[1];
        }

        this.buyPrice.element.text = '$ ' + price;
    }
    
    this.switchButton.script.button.value = country;
    this.buyButton.script.button.value = country;
    this.rewardBuyButton.script.button.value = country;

    this.app.fire('Popup:Open', this.playerEntity);
};

Overlay.prototype.showDesignPopup = function() {
    if(this.isPlacing){
        return false;
    }

    this.designPopup.enabled = true;
    this.app.fire('Popup:Open', this.playerEntity);
};

Overlay.prototype.buyDesign = function(name) {
    //find it from designItems
	var designItem = this.designItems.find(function(item) {
        return item.name === name;
    });

    if(designItem){
        if(pc.MoneyManager.money < designItem.price){
            if(Date.now() - this.lastOfferTime < 1000 * 60 * 2){
                this.app.fire('Money:NoMoney');
            }else{
                this.app.fire('RewardManager:ShowPopup');
            }
            
            this.lastOfferTime = Date.now();
        }else{
            if(designItem.type == 'Props'){
                Utils.addEvent('props_' + name);
                this.isPlacing = true;
                this.app.fire('Building:Place', name);
            }else if(designItem.type == 'Floor'){
                Utils.addEvent('floor_' + name);
                this.app.fire('Decoration:SetFloor', name);
            }else if(designItem.type == 'Wall'){
                Utils.addEvent('wall_' + name);
                this.app.fire('Decoration:SetWall', name);
            }

            this.entity.sound.play('CashComplete');
            this.app.fire('Money:Remove', designItem.price);
            this.app.fire('Popup:Hide', 'DesignPopup');
        }

        Utils.logCheckpoint('decoration_' + name);
    }
};

Overlay.prototype.update = function(dt) {
    if(this.dailyRewardPopup){
        this.dailyRewardTimeEntity.element.text = Utils.mmss(this.dailyRewardTime);
        this.dailyRewardTime-=dt;
    }
};