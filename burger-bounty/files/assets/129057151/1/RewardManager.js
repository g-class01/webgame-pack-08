var RewardManager = pc.createScript('rewardManager');

RewardManager.attributes.add('rewardEntity', { type : 'entity' });
RewardManager.attributes.add('rewardButtonEntity', { type : 'entity' });
RewardManager.attributes.add('rewardCount', { type : 'entity' });
RewardManager.attributes.add('rewardText', { type : 'entity' });

RewardManager.attributes.add('hoverboardEntity', { type : 'entity' });
RewardManager.attributes.add('hoverboardReward', { type : 'entity' });
RewardManager.attributes.add('hoverboardTimerEntity', { type : 'entity' });
RewardManager.attributes.add('upgradeCapacityReward', { type : 'entity' });

RewardManager.attributes.add('disableAdblock', { type : 'entity' });
RewardManager.attributes.add('rewardPopup', { type : 'entity' });

RewardManager.attributes.add('unlockUpgradeGroup', { type : 'entity' });
RewardManager.attributes.add('unlockUpgradeButton', { type : 'entity' });
RewardManager.attributes.add('unlockUpgradeIcon', { type : 'entity' });
RewardManager.attributes.add('unlockUpgradeText', { type : 'entity' });

RewardManager.attributes.add('unlockables', { 
    type : 'json',
    schema : [
        {
            name : 'title',
            type : 'string'
        },
        {
            name : 'entity',
            type : 'entity'
        },
        {
            name : 'icon',
            type : 'asset',
            assetType : 'texture'
        },
        {
            name : 'country',
            type : 'string'
        },
        {
            name : 'event',
            type : 'string'
        },
        {
            name : 'value',
            type : 'string'
        }
    ],
    array : true 
});

RewardManager.prototype.initialize = function() {
    this.time = 0;
    this.adsIndex = 1;
    this.rewardIndex = 1;
    this.disabledAdsIndexes = [];
    //this.disabledAdsIndexes = [1];

    this.alreadyRequestedCarryUpgrade = false;

    this.gameStartTime = Date.now();
    this.isAvailable = false;
    this.isAvailableHoverboard = true;

    this.lastUnlockableTime = Date.now();
    this.unlockUpgradeGroup.enabled = false;

    this.hoverboardTimer = false;
    this.totalReward = 25;

    this.lastRewardOpportunity = Date.now();

    this.rewardEntity.enabled = false;
    this.app.on('RewardManager:Show', this.showRewardButton, this);
    this.app.on('RewardManager:Get', this.getReward, this);
    this.app.on('RewardManager:GetWithCallback', this.getRewardWithCallback, this);
    this.app.on('RewardManager:ShowPopup', this.showRewardPopup, this);

    this.app.on('RewardManager:ShowHoverboardReward', this.showHoverboardReward, this);

    this.app.on('RewardManager:GetHoverboard', this.getHoverboardReward, this);
    this.app.on('RewardManager:EndHoverboard', this.endHoverboardReward, this);

    this.app.on('RewardManager:MaxCapacity', this.showCapacityUpgrade, this);
    this.app.on('RewardManager:RequestCapacity', this.requestCapacityUpgrade, this);

    this.app.on('RewardManager:HideUnlockable', this.hideUnlockable, this);
    this.app.on('RewardManager:UnlockUpgrade', this.unlockReward, this);
};

RewardManager.prototype.requestCapacityUpgrade = function() {
    this.upgradeCapacityReward.enabled = false;

    if(PokiPlugin.adblock){
        this.disableAdblock.enabled = true;
        this.entity.sound.play('Error');

        Timer.setTimeout(function(self){
            self.disableAdblock.enabled = false;
        }, 3000, this);

        return false;
    }

    var self = this;
    
    Utils.addEvent('carry_ads');
    PokiPlugin.showReward(function(){
        self.alreadyRequestedCarryUpgrade = true;

        pc.app.fire('Station:SetUpgrade', 'Carry', 3);
    });

    this.logCheckpoint('capacity_reward');
};

RewardManager.prototype.showCapacityUpgrade = function() {
    if(this.upgradeCapacityReward.enabled){
        return false;
    }

    if(this.alreadyRequestedCarryUpgrade){
        return false;
    }

    if(Date.now() - this.lastCapacityReward < 60000){
        return false;
    }
    
    this.rewardButtonEntity.enabled = false;
    this.rewardPopup.enabled = false;

    this.upgradeCapacityReward.enabled = true;
    this.lastCapacityReward = Date.now();

    Timer.setTimeout(function(self){
        self.upgradeCapacityReward.enabled = false;
    }, 10000, this);
};

RewardManager.prototype.showRewardPopup = function() {
    this.rewardPopup.enabled = true;
};

RewardManager.prototype.getReward = function(value) {
    var self = this;
    
    this.hideRewardOpportunity();
    this.rewardButtonEntity.enabled = true;
    this.rewardPopup.enabled = false;

    if(PokiPlugin.adblock){
        this.disableAdblock.enabled = true;
        this.entity.sound.play('Error');

        Timer.setTimeout(function(self){
            self.disableAdblock.enabled = false;
        }, 3000, this);
        return false;
    }
    
    PokiPlugin.showReward(function(){
        if(value){
            Utils.addEvent('daily_reward');
            pc.app.fire('Money:Add', parseInt(value));
        }else{
            Utils.addEvent('money_add');
            pc.app.fire('Money:Add', self.totalReward);

        }

    });

    //NOTE: do NOT fire 'Popup:Hide RewardPopup' here. RewardPopup is never opened
    //with 'Popup:Open' (showRewardPopup just enables the entity directly), so
    //firing Popup:Hide triggers PopupManager.onHide → spurious 'Popup:Close',
    //which tears down the popup-pause state of whatever popup is currently up
    //(StationUpgrades, DailyReward, etc.). The rewardPopup entity is already
    //disabled directly above (line: this.rewardPopup.enabled = false).
    this.logCheckpoint('reward_' + this.rewardIndex);
    this.rewardIndex++;
};

RewardManager.prototype.getRewardWithCallback = function(name, callback) {
    var self = this;
    
    this.hideRewardOpportunity();
    this.rewardButtonEntity.enabled = true;
    this.rewardPopup.enabled = false;

    if(PokiPlugin.adblock){
        this.disableAdblock.enabled = true;
        this.entity.sound.play('Error');

        Timer.setTimeout(function(self){
            self.disableAdblock.enabled = false;
        }, 3000, this);
        return false;
    }

    Utils.addEvent('reward_' + name);
    PokiPlugin.showReward(function(){
        callback();
    });

    //See note in getReward — Popup:Hide RewardPopup was firing a spurious
    //Popup:Close that tore down the parent popup's pause state mid-ad. RewardPopup
    //is already disabled above; nothing else needs to happen here.
    this.logCheckpoint('reward_' + name);
};

RewardManager.prototype.showHoverboardReward = function() {
    if(Date.now() - this.gameStartTime < 10000){
        return false;
    }

    if(this.hoverboardEntity.enabled){
        return false;
    }

    this.hoverboardReward.enabled = true;

    Timer.setTimeout(function(self){
        self.hoverboardReward.enabled = false;
    }, 10000, this);
};

RewardManager.prototype.getHoverboardReward = function(value) {
    var self = this;

    this.hideRewardOpportunity();
    this.hoverboardReward.enabled = false;

    if(this.hoverboardEntity.enabled){
        return false;
    }

    if(PokiPlugin.adblock){
        this.disableAdblock.enabled = true;
        this.entity.sound.play('Error');

        Timer.setTimeout(function(self){
            self.disableAdblock.enabled = false;
        }, 3000, this);
        return false;
    }
    
    Utils.addEvent('hoverboard');
    PokiPlugin.showReward(function(){
        self.hoverboardEntity.enabled = true;
        self.hoverboardTimerEntity.enabled = true;

    });
};

RewardManager.prototype.endHoverboardReward = function(){
    this.hoverboardEntity.enabled = false;
    this.hoverboardTimerEntity.enabled = false;
};

RewardManager.prototype.showRewardButton = function() {
    if(Date.now() - this.lastRewardOpportunity < 1000 * 60 * 1){
        return false;
    }

    if(this.isAvailable){
        return false;
    }

    this.isAvailable = true;
    this.rewardEntity.enabled = true;
    this.rewardButtonEntity.enabled = true;
    this.time = 11;

    if(this.totalReward < 200){
        this.totalReward+=5;
    }
    
    this.rewardText.element.text = '+' + this.totalReward + '$';
    this.entity.sound.play('ShowUp');

    this.lastRewardOpportunity = Date.now();
};

RewardManager.prototype.showRewardOpportunity = function() {
    if(Date.now() - this.lastRewardOpportunity < 1000 * 60 * 3){
        return false;
    }

    if(this.isAvailable){
        return false;
    }

    this.isAvailable = true;
    this.rewardEntity.enabled = true;
    this.time = 11;

    if(this.totalReward < 200){
        this.totalReward+=5;
    }
    
    this.rewardText.element.text = '+' + this.totalReward + '$';
    this.entity.sound.play('ShowUp');

    this.lastRewardOpportunity = Date.now();
};

RewardManager.prototype.hideRewardOpportunity = function() {
    if(!this.isAvailable){
        return false;
    }

    this.isAvailable = false;
    this.rewardEntity.enabled = false;
};

RewardManager.prototype.getUnlockableReward = function() {
    var output = false;
    var shuffled = Utils.shuffle(this.unlockables);

    for(var index in shuffled){
        var unlockable = shuffled[index];

        if(
            !output &&
            !unlockable.entity.enabled &&
            pc.CountryName == unlockable.country
        ){
            output = unlockable;
        }
    }

    return output;
};

RewardManager.prototype.hideUnlockable = function() {
    this.unlockUpgradeGroup.enabled = false;
};

RewardManager.prototype.unlockReward = function(name) {
    if(PokiPlugin.adblock){
        this.disableAdblock.enabled = true;

        Timer.setTimeout(function(self){
            self.disableAdblock.enabled = false;
        }, 3000, this);

        return false;
    }

    var self = this;
    
    Utils.addEvent('unlock_' + name);
    PokiPlugin.showReward(function(){
        self.applyUnlockableReward(name);
    });
};

RewardManager.prototype.applyUnlockableReward = function(name) {
    var reward = this.getUnlockableByName(name);

    if(reward){
        if(reward.entity){
            reward.entity.enabled = true;
        }

        if(reward.event){
            this.app.fire(reward.event, reward.value);
            //Buy-squares are wired by (action, value) — e.g. OpenIceCream fires
            //'Kitchen:Open'/'IceCream' when paid. The unlockable carries the same pair,
            //so any buy-square matching it should self-complete here (otherwise the
            //money square lingers on top of the now-unlocked station).
            this.app.fire('Station:UnlockedExternally', reward.event, reward.value);
        }

        this.hideUnlockable();
    }
};

RewardManager.prototype.getUnlockableByName = function(name) {
    for(var index in this.unlockables){
        var unlockable = this.unlockables[index];

        if(unlockable.title == name){
            return unlockable;
        }
    }

    return false;
};

RewardManager.prototype.updateUnlockableReward = function() {
    if(Date.now() - this.lastUnlockableTime < 1000 * 60){
        return false;
    }

    var reward = this.getUnlockableReward();

    if(reward){
        this.unlockUpgradeIcon.element.textureAsset = reward.icon;
        this.unlockUpgradeText.element.text = reward.title;
        this.unlockUpgradeButton.script.button.value = reward.title;

        this.unlockUpgradeGroup.enabled = true;
    }

    this.lastUnlockableTime = Date.now();
};

RewardManager.prototype.update = function(dt) {
    this.updateUnlockableReward();

    if(this.isAvailable){
        this.time-=dt;
        this.rewardCount.element.text = Utils.mmss(this.time);

        if(this.time <= 0){
            this.hideRewardOpportunity();
            this.rewardButtonEntity.enabled = false;
        }
    }else{
        this.showRewardOpportunity();
    }
};

RewardManager.prototype.logCheckpoint = function(checkpoint) {
    Utils.service('?request=save_data', {
        game_name : Utils.gameName,
        checkpoint : checkpoint
    }, function(data){
        //console.log(data);
    });
};