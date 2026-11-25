var StationUpgrades = pc.createScript('stationUpgrades');

StationUpgrades.attributes.add('upgrades', { 
    type : 'json',
    schema : [
        {
            name : 'name',
            type : 'string'
        },
        {
            name : 'type',
            type : 'string',
            default : 'StationTime',
            enum : [
                { 'StationTime' : 'StationTime' },
                { 'NPCSpeed' : 'NPCSpeed' },
                { 'CarryCount' : 'CarryCount' }
            ]
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
            name : 'level',
            type : 'number',
            default : 1
        },
        {
            name : 'icon',
            type : 'asset'
        }
    ],
    array : true
});
StationUpgrades.attributes.add('costs', { 
    type : 'json',
    schema : [
        {
            name : 'cost',
            type : 'number',
            default : 100
        },
        {
            name : 'multiplier',
            type : 'number',
            default : 1
        }
    ],
    array : true
});

StationUpgrades.attributes.add('listEntity', { type : 'entity' });
StationUpgrades.attributes.add('listHolder', { type : 'entity' });
StationUpgrades.attributes.add('notificationEntities', { type : 'entity', array : true });

StationUpgrades.prototype.initialize = function() {	
    this.list = [];
    this.listEntity.enabled = false;

    this.lastMoneyThreshold = 30;
    this.lastUpgradeCheck = Date.now();
    this.lastRewardUpgrade = -1;

    this.sinceLastUpgrade = -1;
    this.isTutorialFinished = false;

    Timer.setTimeout(function(self){
        self.loadUpgrades();
    }, 500, this);

    //main functions to improve times and costs
    this.app.on('Station:Upgrade', this.onUpgrade, this);
    this.app.on('Station:RewardUpgrade', this.onRewardUpgrade, this);
    this.app.on('Station:SetUpgrade', this.setUpgradeLevel, this);
    this.app.on('Upgrade:Show', this.showUpgradePopup, this);

    this.app.on('Tutorial:FirstPhaseCompleted', this.onTutorialFinished, this);
    this.app.on('Reset:All', this.reset, this);

    this.setNotificationState(false);
};

StationUpgrades.prototype.reset = function() {
    //reset every upgrade to level 1 and reapply (this also clears the saved level via setItem)
    for(var i = 0; i < this.upgrades.length; i++) {
        this.upgrades[i].level = 1;
        this.onUpgradeUpdate(this.upgrades[i]);
    }

    this.lastMoneyThreshold = 30;
    this.lastUpgradeCheck = Date.now();
    this.lastRewardUpgrade = -1;
    this.sinceLastUpgrade = -1;
    this.isTutorialFinished = false;

    this.listEntity.enabled = false;
    this.clearHolder();
    this.setNotificationState(false);
};

StationUpgrades.prototype.onTutorialFinished = function() {
    this.isTutorialFinished = true;
};

StationUpgrades.prototype.loadUpgrades = function() {
    var self = this;

    this.upgrades.forEach(function(upgrade) {
        var upgradeLevel = Utils.getItem(upgrade.name + '_UpgradeLevel');
        
        if (upgradeLevel) {
            upgrade.level = parseInt(upgradeLevel);

            self.onUpgradeUpdate(upgrade);
        }
    });

    this.renderUpgrades();
};

StationUpgrades.prototype.setUpgradeLevel = function(name, level) {
    var upgrade = this.getUpgrade(name);

    if(upgrade){
        upgrade.level = parseInt(level);
        this.onUpgradeUpdate(upgrade);
    }
};

StationUpgrades.prototype.getUpgrade = function(name) {
    var upgrade = this.upgrades.find(function(upgrade) {
        return upgrade.name === name;
    });
    
    return upgrade;
};

StationUpgrades.prototype.getLevelMultiplier = function(level) {
    if(this.costs[level - 1]){
        return this.costs[level - 1].multiplier;
    }else{
        return this.costs[this.costs.length - 1].multiplier;
    }
};

StationUpgrades.prototype.getLevelCost = function(level) {
    if(this.costs[level - 1]){
        return this.costs[level - 1].cost;
    }else{
        return this.costs[this.costs.length - 1].cost;
    }
};

StationUpgrades.prototype.onRewardUpgrade = function(name) {
    if(Date.now() - this.sinceLastUpgrade < 120){
        return false;
    }

    if(Date.now() - this.lastRewardUpgrade < 1000){
        return false;
    }
    
    var self = this;
    
    this.app.fire('RewardManager:GetWithCallback', 'Upgrade', function(){
        self.onUpgrade(name);
    });

    this.lastRewardUpgrade = Date.now();
    this.sinceLastUpgrade = Date.now();
};

StationUpgrades.prototype.onUpgrade = function(name, button, event) {
    if(Date.now() - this.sinceLastUpgrade < 120){
        return false;
    }

    var upgrade = this.getUpgrade(name);
    var cost = this.getLevelCost(upgrade.level);

    if (upgrade) {
        if(this.costs.length - 1 < upgrade.level){
            return false;
        }

        upgrade.level++;

        this.app.fire('Money:Remove', cost);
        this.app.fire('Sound:Play', 'CashComplete');
        //this.app.fire('Sound:Play', 'RankUp');

        this.onUpgradeUpdate(upgrade);

        Timer.setTimeout(function(self){
            self.renderUpgrades();
        }, 100, this);

        if(event){
            this.app.fire(
                'DealtDamage:Screen', 
                'UPGRADE', 
                new pc.Vec3(event.x, event.y - 50, 0)
            );
        }
    }

    this.sinceLastUpgrade = Date.now();
};

StationUpgrades.prototype.onUpgradeUpdate = function(upgrade) {
    if (upgrade) {
        upgrade.entity.fire('Station:Upgrade', upgrade.level, this.getLevelMultiplier(upgrade.level));

        if(upgrade.station){
            upgrade.station.fire('Complete');
        }

        //save upgrade level for this station
        Utils.setItem(upgrade.name + '_UpgradeLevel', upgrade.level);
    }
};

StationUpgrades.prototype.clearHolder = function() {
	//clear entity items in this.list
	var i = this.list.length;

    while(i--){
        this.list[i].destroy();
    }
    
    this.list = [];
};

StationUpgrades.prototype.renderUpgrades = function() {
    //clone list item, put into listHolder and push list array
    this.clearHolder();

    for(var i = 0; i < this.upgrades.length; i++){
        var upgrade = this.upgrades[i];
        var cost = this.getLevelCost(upgrade.level);
        
        if(upgrade.entity.enabled){
            var listItem = this.listEntity.clone();
            var ratio = upgrade.level * 1 / this.costs.length;
            var stateText = 'Unknown';

            listItem.enabled = true;

            listItem.findByName('Upgrade').script.button.value = upgrade.name;
            listItem.findByName('RewardUpgrade').script.button.value = upgrade.name;
            listItem.findByName('Name').element.text = upgrade.name;
            listItem.findByName('Level').element.text = 'Level ' + upgrade.level;
            listItem.findByName('Fill').setLocalScale(ratio, 1, 1);

            if(upgrade.type == 'StationTime'){
                stateText = this.getLevelMultiplier(upgrade.level) + ' seconds';
            }

            listItem.findByName('State').element.text = stateText;
            listItem.findByName('Max').enabled = false;
            listItem.findByName('Icon').element.textureAsset = upgrade.icon;

            if(upgrade.level > this.costs.length - 1){
                listItem.findByName('Max').enabled = true;
                listItem.findByName('Upgrade').enabled = false;
                listItem.findByName('RewardUpgrade').enabled = false;

                listItem.findByName('PriceLabel').enabled = false;
            }else{
                if(pc.MoneyManager.money < cost){
                    //RewardUpgrade ad button stays available as long as the player can't afford
                    //the cash upgrade — Poki single-ad-per-upgrade policy is satisfied because
                    //each successful watch consumes exactly one upgrade level.
                    listItem.findByName('Upgrade').enabled = false;
                    listItem.findByName('RewardUpgrade').enabled = true;
                }else{
                    listItem.findByName('Upgrade').enabled = true;
                    listItem.findByName('RewardUpgrade').enabled = false;
                }

                listItem.findByName('Price').element.text = '$' + cost;
            }

            this.listHolder.addChild(listItem);
            this.list.push(listItem);
        }
    }
};

StationUpgrades.prototype.showUpgradePopup = function(){
    this.renderUpgrades();
    this.setNotificationState(false);
};

StationUpgrades.prototype.setNotificationState = function(state){
    for(var i = 0; i < this.notificationEntities.length; i++){
        this.notificationEntities[i].enabled = state;
    }
};

StationUpgrades.prototype.checkUpgradeThreshold = function(){
    if(Date.now() - this.lastUpgradeCheck < 1000){
        return false;
    }

    for(var i = 0; i < this.upgrades.length; i++){
        var upgrade = this.upgrades[i];
        var cost = this.getLevelCost(upgrade.level);

        if(upgrade.entity.enabled){
            this.lastMoneyThreshold = Math.max(cost, this.lastMoneyThreshold);
        }
    }

    if(pc.MoneyManager.money >= this.lastMoneyThreshold){
        this.setNotificationState(true);
    }

    this.lastUpgradeCheck = Date.now();
};

StationUpgrades.prototype.update = function(){
    if(!this.isTutorialFinished){
        return false;
    }

    this.checkUpgradeThreshold();
};