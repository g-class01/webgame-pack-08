var UnlockLevelGateway = pc.createScript('unlockLevelGateway');

UnlockLevelGateway.attributes.add('country', { type : 'string', array : true });
UnlockLevelGateway.attributes.add('speed', { type:'number', default: 0.5 });
UnlockLevelGateway.attributes.add('hoverEntity', { type : 'entity' });
UnlockLevelGateway.attributes.add('progressEntity', { type : 'entity' });
UnlockLevelGateway.attributes.add('timeoutPopupShow', { type : 'number', default : 2000 });

UnlockLevelGateway.prototype.initialize = function() {
    this.selectableCountries = [];
    this.selectedCountry = false;
    this.progress = 0;
    this.lastProgress = 0;
    this.who = false;
    this.lastPopupShow = Date.now();
    this.hideTrigger = false;
    this.leaveTrigger = false;

    this.entity.on('Trigger', this.onTrigger, this);
    this.entity.on('Leave', this.onLeave, this);

    this.setCountry();

    this.app.on('Country:Switch', this.showPopup, this);
    this.app.on('Popup:Hide', this.onPopupHide, this);

    this.app.on('BranchManager:Switch', this.onBranchChange, this);
    this.app.on('Reset:All', this.reset, this);

    this.on('destroy', this.onDestroy, this);
};

UnlockLevelGateway.prototype.reset = function() {
    this.selectableCountries = [];
    this.resetProgress();
    this.setCountry();
};

UnlockLevelGateway.prototype.onBranchChange = function(){
    this.resetProgress();
};

UnlockLevelGateway.prototype.setCountry = function(data){
    if(!this.country && this.country.length == 0){
        return false;
    }
    
    if(!data){ //init
        this.country.forEach(country => {
            if (country != 'USA' &&  Utils.getItem('Branch_' + country) !== 'Unlocked') {
                this.selectableCountries.push(country);
            }
        });
    }else{ //Callback
        var countryIndex = this.selectableCountries.indexOf(data);

        if (countryIndex !== -1) {
            this.selectableCountries.splice(countryIndex, 1);
        }
    }
   
    
    if (this.selectableCountries.length === 0) { //when all country are unlocked
        this.selectedCountry = this.country[0];
        this.entity.findByName('Icon').element.textureAsset = this.app.assets.find(this.selectedCountry + '-Flag.png');
        this.entity.findByName('Text').element.text = 'Switch \n' + this.selectedCountry;
    } else { //when there are still country to unlock
        this.selectedCountry = this.selectableCountries[Math.floor(Math.random() * this.selectableCountries.length)];
    }
};

UnlockLevelGateway.prototype.showPopup = function(){
    if(Utils.getItem('Branch_' + this.selectedCountry) == 'Unlocked'){
        this.setCountry(this.selectedCountry);
    }
    Utils.addEvent('branch_key_trigger');
};

UnlockLevelGateway.prototype.triggerPopup = function(){
    if(this.selectableCountries.length === 0){
        this.resetProgress();
        Utils.addEvent('branch_key_switch_' + this.selectedCountry);
        pc.app.fire('BranchManager:Switch', this.selectedCountry); // switch country
        return false;
    }

    this.who = false;
    this.hideTrigger = false;
    pc.app.fire('Country:Switch', this.selectedCountry); // Show country switch popup

    this.lastPopupShow = Date.now();
};

UnlockLevelGateway.prototype.onPopupHide = function(name){
    if (name !== 'CountryPopup') return;

    this.resetProgress();

    this.triggerGateway = Timer.setTimeout(function(self){
        if(!self.leaveTrigger){
            self.hideTrigger = true;
        }
    }, 2000, this)
};

UnlockLevelGateway.prototype.onTrigger = function(entity){
    this.who = entity;
    this.hideTrigger = false;
};

UnlockLevelGateway.prototype.onLeave = function(){
    this.leaveTrigger = true;
    this.resetProgress();
};

UnlockLevelGateway.prototype.setProgress = function(dt){
    this.leaveTrigger = false;
    this.progress+= this.speed * dt;
    this.lastProgress = Date.now();
    if(this.progressEntity){
        this.progressEntity.enabled = true;
        this.app.fire('MaterialShader:Progress', 'progress', this.progress);
    }

    if(this.progress >= 1.0){
        this.triggerPopup();
    }
};

UnlockLevelGateway.prototype.resetProgress = function(){
    this.who = false;
    this.progress = 0;
    this.hideTrigger = false;
    this.leaveTrigger = false;
    
    Timer.clearTimeout(this.triggerGateway);
    if(this.progressEntity){
        this.progressEntity.enabled = false;
        this.app.fire('MaterialShader:Progress', 'progress', 0);
    }
};

UnlockLevelGateway.prototype.onDestroy = function(){
    this.app.off('Country:Switch', this.showPopup, this);
    this.app.off('Popup:Hide', this.onPopupHide, this);
    this.app.off('BranchManager:Switch', this.onBranchChange, this);
};

UnlockLevelGateway.prototype.update = function(dt) {
    if(Date.now() - this.lastPopupShow < this.timeoutPopupShow){
        return false;
    }

    if(this.who || this.hideTrigger){
        if(Date.now() - this.lastProgress > 1000){
            this.progress = 0;
        }
        
        this.setProgress(dt);
    }
};