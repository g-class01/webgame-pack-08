var Station = pc.createScript('station');

Station.attributes.add('condition', { type : 'string', default : 'None' });
Station.attributes.add('conditionValue', { type : 'string', default : '0' });

Station.attributes.add('global', { type : 'boolean', default : false });
Station.attributes.add('slowFeedback', { type : 'boolean', default : true });
Station.attributes.add('connectedEntity', { type : 'entity' });
Station.attributes.add('timeBar', { type : 'entity' });
Station.attributes.add('cloneEntity', { type : 'entity' });
Station.attributes.add('onHoverShow', { type: 'entity' });
Station.attributes.add('onAppearDisable', { type: 'entity' });
Station.attributes.add('onAppearDisable2', { type: 'entity' });
Station.attributes.add('enableOnComplete', { type: 'entity' });
Station.attributes.add('disableOnComplete', { type: 'entity' });
Station.attributes.add('eventOnEnable', { type: 'string' });
Station.attributes.add('action', { type : 'string', default : 'Add:Item' });
Station.attributes.add('value', { type : 'string', default : 'Wood' });
Station.attributes.add('time', { type : 'number', default : 1 });
Station.attributes.add('money', { type : 'number', default : 0 });
Station.attributes.add('moneyStep', { type : 'number', default : 1 });
Station.attributes.add('loop', { type : 'boolean', default : false });
Station.attributes.add('bar', { type : 'boolean', default : true });
Station.attributes.add('barName', { type : 'string', default : 'Bar' });
Station.attributes.add('visualBar', { type : 'entity' });
Station.attributes.add('doDestroy', { type : 'boolean', default : true });
Station.attributes.add('waitAnimation', { type : 'string', default : '' });
Station.attributes.add('waitValue', { type : 'string', default : '' });
Station.attributes.add('waitTime', { type : 'number', default : 750 });

Station.prototype.initialize = function() {
    this.offset      = new pc.Vec3(0, 3, 0);
    this.createdAt   = Date.now();
    this.startTime   = parseInt('' + this.time);

    //full setup runs regardless of completion state — reset needs startMoney, listeners,
    //and the moneyText reference even for stations that were previously bought
    this.who = false;
    this.waitingVolume = 0;

    this.hoverEntity = this.entity.findByName('Hover');
    this.edgeEntity  = this.entity.findByName('Edge');
    this.edgeEntity.enabled = false;

    this.progressEntity = this.entity.findByName('Progress');

    if(this.progressEntity){
        this.progressEntity.enabled = false;
    }

    this.animationEntity = this.entity.findByName('Animation');

    this.groupEntity = this.entity.findByName('Group');

    this.moneyIcon  = this.entity.findByName('MoneyIcon');
    this.moneyText  = this.entity.findByName('MoneyText');

    if(this.moneyText){
        this.moneyText.element.text = this.money + '$';
    }

    if(this.onAppearDisable){
        this.onAppearDisable.enabled = false;
    }

    if(this.onAppearDisable2){
        this.onAppearDisable2.enabled = false;
    }

    this.startMoney = this.money;

    this.entity.on('Trigger', this.onTrigger, this);
    this.entity.on('Leave', this.onLeave, this);
    this.entity.on('Station:Upgrade', this.stationUpgrade, this);

    this.entity.on('Reset', this.reset, this);
    this.entity.on('Complete', this.onComplete, this);

    this.app.on('Reset:All', this.onResetAll, this);
    this.app.on('Station:UnlockedExternally', this.onUnlockedExternally, this);

    this.enoughMoneyToBuyOnce = false;
    this.lastMoneyCheck = Date.now();

    //if previously bought, schedule the disable + clone-respawn at +50ms (was an early
    //return before, but that left the script half-initialized and broke post-reset state)
    var isCompleted = Utils.getItem('Station_' + this.entity._guid);
    if(isCompleted && isCompleted == 'Completed'){
        Timer.setTimeout(function(self){
            self.completeCarry();
            self.destroy();
        }, 50, this);
    }
};

Station.prototype.onResetAll = function() {
    //destroy any building this station spawned when bought
    if(this.spawnedClone){
        this.spawnedClone.destroy();
        this.spawnedClone = null;
    }

    //wipe completion state so the buy prompt re-appears when the station is re-shown
    this.isDestroyed = false;
    this.money = this.startMoney;
    this.who = false;
    this.enoughMoneyToBuyOnce = false;
    this.alreadyCompleted = false;

    if(this.moneyText){
        this.moneyText.element.text = this.money + '$';
    }
    if(this.groupEntity){
        this.groupEntity.enabled = true;
    }
    if(this.onAppearDisable){
        this.onAppearDisable.enabled = false;
    }
    if(this.onAppearDisable2){
        this.onAppearDisable2.enabled = false;
    }

    //do NOT touch this.entity.enabled — managers (TableManager.reset) and Conditions
    //(Condition.onReset) decide which stations are visible at fresh-start
    this.entity.enabled = false;
};

Station.prototype.onComplete = function() {
    Timer.setTimeout(function(self){
        self.completeCarry();
        self.destroy();
    }, 50, this);
};

Station.prototype.onUnlockedExternally = function(actionName, actionValue) {
    //Buy-square self-completes when its (action, value) was already delivered through
    //another path — e.g. RewardManager.applyUnlockableReward fires a matching
    //Kitchen:Open/Kitchen:Assistant for an unlockable. Without this the money square
    //stays alive on top of the now-unlocked station and intercepts the player's
    //trigger so they can't interact with it.
    if(this.isDestroyed) return;
    if(this.action !== actionName) return;
    if(this.value !== actionValue) return;

    this.completeCarry();
    this.destroy();
};

Station.prototype.stationUpgrade = function(level, multiplier) {
    this.time = this.startTime / multiplier;

    if(this.timeBar){
        this.timeBar.script.timeline.duration = this.time;
    }
};

Station.prototype.conditionCallback = function(entity) {
    if(this.bar){
        this.app.fire(
            'Timeline:Fill@Loop', 
            false
        );

        this.app.fire(
            'Timeline:Fill@Time', 
            this.time
        );

        this.app.fire(
            'World2Screen:Show', 
            this.barName,
            this.entity,
            this.offset
        );
    }
    this.who = entity;
    this.lastTrigger = Date.now();
    this.edgeEntity.element.color = pc.Color.GREEN;
};

Station.prototype.conditionFallback = function(entity) {
    this.app.fire('Sound:Play', 'Error');
    this.edgeEntity.element.color = pc.Color.RED;

    if(this.money > 0){
        this.app.fire('RewardManager:Show', 'Money');
        this.app.fire('Money:NoMoney');
    }
};

Station.prototype.onTrigger = function(entity) {
    if(this.progressEntity){
        this.progressEntity.enabled = true;   
    }

    if(this.onHoverShow){
        this.onHoverShow.enabled = true;
    }

    if(
        this.hoverEntity && 
        this.hoverEntity.element &&
        this.hoverEntity.element.opacity
    ){
        this.hoverEntity.element.opacity = 0.5;
        
        this.app.fire('Sound:Play', 'Hover');
    }
    
    if(this.slowFeedback){
        //Loop-tagged triggers fire every ~80ms; without this guard the 500ms timer
        //gets reset every frame and never expires while standing on the pad
        if(!this.triggerScheduled){
            this.triggerScheduled = true;
            this.triggerTimer = Timer.setTimeout(function(self){
                self.triggerScheduled = false;
                self.updateTrigger(entity);
            }, 500, this);
        }
    }else{
        this.updateTrigger(entity);
    }
};

Station.prototype.updateTrigger = function(entity) {
    var self = this;

    if(this.progressEntity){
        this.progressEntity.enabled = true;   
    }

    if(
        this.hoverEntity &&
        this.hoverEntity.element
    ){
        this.hoverEntity.element.opacity = 0.5;

        if(this.condition == 'None'){
            this.conditionCallback(entity);
        }else{
            this.app.fire(this.condition, this.conditionValue, function(){
                self.conditionCallback(entity);
            }, function(){
                self.conditionFallback(entity);
            });
        }

        this.edgeEntity.enabled = true;
    }

    if(entity){
        this.waitingVolume = 1;
        this.app.fire(this.waitAnimation, this.waitValue, this.waitTime);
    }
};

Station.prototype.onLeave = function(entity) {
    Timer.clearTimeout(this.triggerTimer);
    this.triggerScheduled = false;

    if(this.progressEntity){
        this.progressEntity.enabled = false;   
    }

    if(this.onHoverShow){
        this.onHoverShow.enabled = false;
    }

    if(this.hoverEntity){
        this.hoverEntity.element.opacity = 0.8;

        this.who = false;

        if(this.bar){
            this.app.fire(
                'World2Screen:Hide', 
                this.barName
            );
        }

        this.edgeEntity.enabled = false;
    }

    this.app.fire('ThrowDisable');
    this.waitingVolume = 0;
};

Station.prototype.reset = function() {
    if(this.groupEntity){
        this.groupEntity.enabled = true;
    }

    this.money = this.startMoney;

    if(this.moneyText){
        this.moneyText.element.text = this.money + '$';
    }
};

Station.prototype.complete = function() {
    if(this.money <= 0 && !this.doDestroy){
        if(this.groupEntity){
            this.groupEntity.enabled = false;
        }

        return false;
    }

    //Buy stations (those with a moneyText counter) tick once per cycle. MoneyManager.remove
    //silently no-ops on insufficient funds, so without a guard the station's local counter
    //kept decrementing while the player paid nothing — finishing the buy for free.
    //
    //If the player has SOME money but less than a full moneyStep, charge what they can
    //afford instead of rejecting the tick. Otherwise the tail balance under moneyStep gets
    //stranded forever — e.g. $4 in the wallet vs. a station with moneyStep=5 wouldn't move.
    var charge = this.moneyStep;

    if(this.moneyText && pc.MoneyManager){
        if(pc.MoneyManager.money <= 0){
            this.who = false;
            if(this.edgeEntity && this.edgeEntity.element){
                this.edgeEntity.element.color = pc.Color.RED;
            }
            this.app.fire('Sound:Play', 'Error');
            this.app.fire('Money:NoMoney');

            return false;
        }
        if(pc.MoneyManager.money < this.moneyStep){
            charge = pc.MoneyManager.money;
        }
    }

    this.money-=charge;

    if(this.moneyText){
        this.moneyText.element.text = this.money + '$';
        this.app.fire('Money:Remove', charge);
    }

    if(this.money <= 0){
        this.completeCarry();

        if(this.startMoney > 0 && this.doDestroy){
            this.destroy();

            return false;
        }
    }

    var who = this.who;

    this.who = false;
    this.updateTrigger(who);

    this.enoughMoneyToBuyOnce = true;
};

Station.prototype.destroy = function() {
    if(this.isDestroyed){
        return false;
    }

    //disable instead of destroy so reset can bring the buy prompt back without a page reload
    this.entity.enabled = false;

    Utils.setItem('Station_' + this.entity._guid, 'Completed');

    this.app.fire('MaterialShader:Progress', 'progress', 0.001);

    this.enoughMoneyToBuyOnce = true;

    this.isDestroyed = true;
};

Station.prototype.completeCarry = function(){
    this.app.fire(
        'World2Screen:Hide', 
        this.barName
    );

    if(this.action){
        if(this.global){
            this.app.fire(this.action, this.value, this.connectedEntity);
        }else if(this.who){
            //this.who is false on the load-time replay branch and on external-unlock
            //completion (no player standing on the square); skipping the action is
            //correct — it was already delivered at original buy time.
            this.who.fire(this.action, this.value, this.connectedEntity);
        }
    }

    if(this.eventOnEnable){
        this.app.fire(this.eventOnEnable);
    }

    if (this.enableOnComplete) {
        this.enableOnComplete.enabled = true;
    }

    if (this.disableOnComplete) {
        this.disableOnComplete.enabled = false;
    }

    if(this.cloneEntity){
        var cloneBuilding = this.cloneEntity.clone();

        cloneBuilding.enabled = true;
        cloneBuilding.sound.play('Whoosh');
        cloneBuilding.sound.play('Drop');

        this.app.fire('EffectManager:LandSmoke', cloneBuilding.getPosition());

        this.app.root.addChild(cloneBuilding);
        this.spawnedClone = cloneBuilding;

        this.app.fire('Motion', 'LittleShake');
    }

    var who = this.who;

    this.who = false;
    this.updateTrigger(who);
};

Station.prototype.hasEnoughMoney = function() {
    if(this.enoughMoneyToBuyOnce){
        return false;
    }

    if(this.who){
        return false;
    }

    this.app.fire('Camera:Focus', this.entity);
    this.enoughMoneyToBuyOnce = true;
};

Station.prototype.update = function(dt) {
    //Halt during explicit pause / ad (timeScale===0) AND during popup/menu open
    //(pc.hasActivePopup). The latter is the path that lets customer-side timers
    //and station spawn ticks freeze in lockstep with the menu, instead of letting
    //money/check loops run real-time underneath an open UI.
    if(pc.app.timeScale === 0 || pc.hasActivePopup){
        return false;
    }

    if(
        Date.now() - this.lastMoneyCheck > 1500 && 
        !this.isCompleted &&
        this.money > 0
    ){
        var self = this;
    
        this.app.fire('Money:Has', this.money, function(){
            self.hasEnoughMoney();
        });

        this.lastMoneyCheck = Date.now();
    }

    if(
        this.who &&
        Date.now() - this.lastTrigger > this.time * 1000
    ){
        if(this.loop){
            this.complete();

            if(this.bar){
                this.app.fire(
                    'World2Screen:Show', 
                    this.barName,
                    this.entity,
                    this.offset
                );
            }
        }else{
            this.complete();

            if(this.doDestroy){
                this.destroy();
            }else{
                this.completeCarry();
            }
        }
    }

    if(this.entity.sound && this.entity.sound.slots['Waiting']){
        this.entity.sound.slots['Waiting'].volume = pc.math.lerp(
            this.entity.sound.slots['Waiting'].volume,
            this.waitingVolume,
            0.1
        );
    }

    if(this.visualBar){
        //var ratio calculate start money and current money.
        var ratio = (this.startMoney - this.money) / this.startMoney;

        this.visualBar.setLocalScale(ratio, 1, 1);
    }

    if(this.animationEntity){
        if(
            this.who &&
            !this.isDestroyed
        ){
            this.animationEntity.enabled = true;
        }else{
            this.animationEntity.enabled = false;
        }
    }

    if(
        this.who &&
        !this.isDestroyed &&
        this.progressEntity
    ){
        var ratio = (this.startMoney - this.money) / this.startMoney;

        this.app.fire('MaterialShader:Progress', 'progress', ratio);
    }
};