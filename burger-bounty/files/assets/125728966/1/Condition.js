var Condition = pc.createScript('condition');

Condition.attributes.add('eventName', { type : 'string' });
Condition.attributes.add('eventValue', { type : 'string' });
Condition.attributes.add('complete', { type : 'string' });
Condition.attributes.add('time', { type : 'number', default : 0});
Condition.attributes.add('station', { type : 'entity' });
Condition.attributes.add('upgradeStation', { type : 'entity' });
Condition.attributes.add('onEnableEvent', { type : 'string' });
Condition.attributes.add('onEnableArg', { type : 'string' });

Condition.prototype.preInitialize = function() {
    this.isCompleted = false;
    this.app.on(this.eventName, this.onFunction, this);
};

Condition.prototype.initialize = function() {
    if(this.upgradeStation && this.upgradeStation.enabled){
        console.log('Already completed: ', this.entity.name);
        this.onFunctionValid();
    }

    if(this.station){
        this.station.enabled = true;
    }

    if(this.onEnableEvent){
        this.app.fire(this.onEnableEvent, this.onEnableArg);
    }

    this.entity.on('Complete', this.onComplete, this);
    this.on('state', this.onStateChange, this);
    this.app.on('Reset:All', this.onReset, this);

    if(this.alreadyCompleted){
        this.onFunctionValid();
    }
};

Condition.prototype.onReset = function() {
    //don't enable anything synchronously — defer to the next time this tutorial
    //point is re-enabled by TutorialManager.setStep. tutorial points the player
    //hasn't progressed back to stay disabled, so their station/onEnableEvent never replay
    this.isCompleted = false;
    this.alreadyCompleted = false;
    this.shouldReplayOnEnable = true;
};

Condition.prototype.onStateChange = function(state) {
    if(state === true && this.shouldReplayOnEnable){
        this.shouldReplayOnEnable = false;

        if(this.station){
            this.station.enabled = true;
        }
        if(this.onEnableEvent){
            this.app.fire(this.onEnableEvent, this.onEnableArg);
        }
    }
};

Condition.prototype.onComplete = function() {
    this.isCompleted = true;
};

Condition.prototype.onFunction = function(value) {
    var stringified = value + '';

    if(stringified == this.eventValue + ''){
        Utils.logCheckpoint(this.entity.name);
    }

    if(!this.entity.enabled){
        //check if it's already completed, when turn come to this, check it
        if(value && value == this.eventValue){
            this.alreadyCompleted = true;
        }
        
        return false;
    }

    //dont execute if it's this.isCompleted
    if (this.isCompleted){
        return false;
    }

    if(value && value != this.eventValue){
        return false;
    }

    this.onFunctionValid();
};

Condition.prototype.onFunctionValid = function() {
    //trigger app fire complete with time delay
    if(this.time > 0) {
        Timer.setTimeout(function(self) {
            pc.app.fire(self.complete, self.entity.tutorialIndex);
        }, 1000 * this.time, this);
    }else{
        this.app.fire(this.complete, this.entity.tutorialIndex);
    }

    this.isCompleted = true;
};