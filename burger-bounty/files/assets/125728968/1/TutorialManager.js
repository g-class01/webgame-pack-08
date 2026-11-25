var TutorialManager = pc.createScript('tutorialManager');

TutorialManager.attributes.add('suffix', { type : 'string', default : '' });
TutorialManager.attributes.add('arrowEntity', { type : 'entity' });
TutorialManager.attributes.add('doorEntity1', { type : 'entity' });
TutorialManager.attributes.add('doorEntity2', { type : 'entity' });
TutorialManager.attributes.add('firstLockEntity', { type : 'entity' });
TutorialManager.attributes.add('lockedEntities', { type : 'entity', array : true });
TutorialManager.attributes.add('playerEntity', { type : 'entity' });
TutorialManager.attributes.add('lineEntity', { type : 'entity' });
TutorialManager.prototype.initialize = function() {
    this.onStateChange(true);
    this.on('state', this.onStateChange, this);
    this.on('destroy', this.onDestroy, this);
};

TutorialManager.prototype.onStateChange = function(state) {
    if(state === true){
        this.createdAt = Date.now();
        this.lastTriggeredStation = new pc.Vec3(0, 0, 0);
        this.lineEntity.enabled = false;

        this.currentStep = -1;
        this.tutorialPoints = this.entity.findByTag('TutorialIndex');

        //disable tutorial points
        for(var i = 0; i < this.tutorialPoints.length; i++) {
            if(this.tutorialPoints[i]){
                this.tutorialPoints[i].script.condition.preInitialize();
                this.tutorialPoints[i].tutorialIndex = i;
                this.tutorialPoints[i].enabled = false;
            }
        }

        var tutorialIndex = Utils.getItem('TutorialIndex' + this.suffix);
        
        if(tutorialIndex){
            this.currentStep = parseInt(tutorialIndex);
        }

        if(this.currentStep === -1){
            this.arrowEntity.enabled = false;
            Timer.setTimeout(function(self){
                self.nextStep();
            }, 1000, this);
        }else{
            Timer.setTimeout(function(self){
                self.onLoad();
            }, 100, this);
        }

        this.app.on('Tutorial:SetIndex', this.setIndex, this);
        this.app.on('Tutorial:Next', this.nextStep, this);
        this.app.on('Tutorial:Complete', this.onComplete, this);

        this.app.on('Tutorial:Arrow', this.setArrow, this);
    }else{
        this.app.off('Tutorial:SetIndex', this.setIndex, this);
        this.app.off('Tutorial:Next', this.nextStep, this);
        this.app.off('Tutorial:Complete', this.onComplete, this);

        this.app.off('Tutorial:Arrow', this.setArrow, this);
    }
};

TutorialManager.prototype.onDestroy = function() {    
    this.onStateChange(false);
};

TutorialManager.prototype.unlockDoors = function() {    
    if(this.doorEntity1){
        this.doorEntity1.fire('Activate');
        this.doorEntity2.fire('Activate');
        this.firstLockEntity.destroy();
    }

    this.arrowEntity.enabled = false;
    
    this.app.fire('Tutorial:FirstPhaseCompleted');
};

TutorialManager.prototype.unlockPopups = function() {
    //lockedEntities
    for(var i = 0; i < this.lockedEntities.length; i++){
        this.lockedEntities[i].enabled = false;
    }
};

TutorialManager.prototype.onLoad = function() {
    console.log('Onload completed', this.currentStep);

    //enable until
    for(var i = 0; i < this.currentStep; i++) {
        if(this.tutorialPoints[i]){
            this.tutorialPoints[i].enabled = true;
            this.tutorialPoints[i].fire('Complete');
        }
    }

    if(this.currentStep > 0){
        this.unlockDoors();
    }

    if(this.currentStep > 1){
        this.unlockPopups();
    }

    this.setStep();
};

TutorialManager.prototype.setIndex = function(value) {
    var index = parseInt(value);

    if(index >= this.currentStep){
        this.currentStep = index;
        this.nextStep();
    }else{
        //this.setStep
    }
};

TutorialManager.prototype.saveCheckpoint = function() {
    //This part was totally wrong, because we can't distinguist users with their unlocking order and determine the problem. This only shows where they churn, but doesn't give why they churn.
    var tutorialPoint = this.tutorialPoints[this.currentStep];

    /*
    if(window.location.href.search('playcanvas') > -1){
        return false;
    }
    */

    /*
    if(tutorialPoint){
        var currentStationName = tutorialPoint.name;

        if(typeof PokiSDK !== 'undefined'){
            PokiSDK.customEvent('game', 'segment', { label: 'level', value: currentStationName + '' });
        }

        this.logCheckpoint(currentStationName);
    }
    */
};

TutorialManager.prototype.nextStep = function() {
    /*
    if(Date.now() - this.createdAt < 1000){
        return false;
    }
    */

    //enable next step
    if(this.tutorialPoints[this.currentStep]){
        this.tutorialPoints[this.currentStep].enabled = false;
    }

    this.saveCheckpoint();
    
    this.currentStep++;

    if(this.currentStep > 0){
        this.unlockDoors();
    }

    if(this.currentStep > 1){
        this.unlockPopups();
    }

    this.setStep();
};

TutorialManager.prototype.setStep = function() {
    if(this.currentStep - 1 == this.tutorialPoints.length){
        this.arrowEntity.enabled = false;
        return false;
    }

    if(!this.tutorialPoints[this.currentStep]){
        this.arrowEntity.enabled = false;
        return false;
    }

    var tutorialCondition = this.tutorialPoints[this.currentStep].script.condition;

    if(
        tutorialCondition && 
        tutorialCondition.upgradeStation
    ){
        var isCompleted = Utils.getItem('Station_' + tutorialCondition.upgradeStation._guid);

        console.log('Already completed Station_' + tutorialCondition.upgradeStation._guid);

        if(isCompleted){
            Timer.setTimeout(function(self){
                self.nextStep();
            }, 1000, this);
            
            return false;
        }
    }

    Timer.clearTimeout(this.arrowTimer);

    var position = this.tutorialPoints[this.currentStep].getPosition().clone();

    this.tutorialPoints[this.currentStep].enabled = true;

    if(this.tutorialPoints[this.currentStep].tags.list().indexOf('NoArrow') === -1){
        this.arrowEntity.enabled = true;
        this.arrowEntity.setPosition(position);
    }else{
        this.arrowEntity.enabled = false;
    }

    //trigger camera follow global event
    //https://github.com/OnRushStudio/burger-bounty/issues/80
    //this.app.fire('Camera:Focus', this.tutorialPoints[this.currentStep]);
    Utils.setItem('TutorialIndex' + this.suffix, this.currentStep);
};

TutorialManager.prototype.onComplete = function() {
    this.arrowEntity.enabled = false;
    Utils.setItem('Tutorial', 'Completed');
};

TutorialManager.prototype.setArrow = function(entity) {
    this.arrowEntity.enabled = true;
    this.arrowEntity.setPosition(entity.getPosition());
    
    Timer.clearTimeout(this.arrowTimer);
    this.arrowTimer = Timer.setTimeout(function(self){
        self.arrowEntity.enabled = false;
    }, 3000, this);
};

TutorialManager.prototype.logCheckpoint = function(checkpoint) {
    console.log('Completed:', checkpoint);
    
    Utils.service('?request=save_data', {
        game_name : Utils.gameName,
        checkpoint : checkpoint
    }, function(data){
        //console.log(data);
    });
};

TutorialManager.prototype.update = function(dt) {
    if(this.arrowEntity.enabled){
        var distance = this.playerEntity.getPosition().sub(this.arrowEntity.getPosition()).length();

        if(distance < 0.5){
            this.arrowEntity.enabled = false;
        }
    }

    if(this.tutorialPoints.length == this.currentStep){
        this.lineEntity.enabled = false;
        return false;
    }

    var position = this.playerEntity.getPosition();
    var arrowPosition = this.arrowEntity.getPosition();

    var angle = Utils.lookAt(
        position.x,
        position.z,
        arrowPosition.x,
        arrowPosition.z
    );
    
    var distance = arrowPosition.clone().sub(
        position.clone()
    ).length();

    if(distance < 2.0){
        this.lastTriggeredStation = arrowPosition.clone();
        this.lineEntity.enabled = false;
    }else{
        var distanceFromLastStation = this.lastTriggeredStation.clone().sub(arrowPosition).length();

        if(distanceFromLastStation < 0.1){
            //this.lineEntity.enabled = false;
        }else{
            this.lineEntity.enabled = true;
            this.lineEntity.setLocalEulerAngles(0, angle * pc.math.RAD_TO_DEG, 0);
            this.lineEntity.setLocalScale(1, 1, distance / 10.0);
        }
    }
};