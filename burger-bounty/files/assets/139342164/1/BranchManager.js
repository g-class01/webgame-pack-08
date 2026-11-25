var BranchManager = pc.createScript('branchManager');

BranchManager.attributes.add('defaultCountry', { type : 'string', default : 'USA' });
BranchManager.attributes.add('branches', { type : 'entity', array : true });
BranchManager.attributes.add('buttons', { type : 'entity', array : true });
BranchManager.attributes.add('playerEntity', { type : 'entity' });
BranchManager.attributes.add('branchPrices', { type : 'number', array : true});
BranchManager.attributes.add('disableAdblock', { type : 'entity' });
BranchManager.attributes.add('adsCountText', { type : 'entity' });
BranchManager.prototype.initialize = function() {
    pc.CountryName = this.defaultCountry;

    this.app.on('BranchManager:Switch', this.switchBranch, this);
    this.app.on('BranchManager:Unlock', this.unlockBranch, this);
    this.app.on('BranchManager:UnlockReward', this.unlockWithAds, this);
    this.app.on('Reset:All', this.reset, this);

    this._setUnlockLabel();

    this.app.fire('BranchManager:Switch', this.defaultCountry);
};

BranchManager.prototype._setUnlockLabel = function() {
    if(this.adsCountText && this.adsCountText.element){
        this.adsCountText.element.text = 'UNLOCK WITH AD';
    }
};

BranchManager.prototype.reset = function() {
    this._setUnlockLabel();
    pc.CountryName = this.defaultCountry;
    this.setBranch(this.defaultCountry);
};

BranchManager.prototype.unlockWithAds = function(country, button, event) {
    if(PokiPlugin.adblock){
        this.disableAdblock.enabled = true;

        Timer.setTimeout(function(self){
            self.disableAdblock.enabled = false;
        }, 3000, this);

        return false;
    }

    var self = this;

    Utils.addEvent('branch_change');

    //Poki policy: one rewardedBreak per upgrade — country unlock is the reward
    PokiPlugin.showReward(function(){
        self.doUnlock(country);

        if(event){
            pc.app.fire(
                'DealtDamage:Screen',
                'UNLOCKED',
                new pc.Vec3(event.x, event.y - 50, 0)
            );
        }
    });
};

BranchManager.prototype.unlockBranch = function(country, button, event) {
    var price = 0;

    if(country == 'Japan'){
        price = this.branchPrices[0];
    } else if (country == 'Italy'){
        price = this.branchPrices[1];
    }

    if(pc.MoneyManager.money >= price){
        //remove branch money
        this.app.fire('Money:Remove', price);

        //add start money
        this.app.fire('Money:Add', 55);

        this.app.fire(
            'DealtDamage:Screen', 
            'UNLOCKED', 
            new pc.Vec3(event.x, event.y - 50, 0)
        );

        this.doUnlock(country);
    }else{
        this.entity.sound.play('Error');
        this.app.fire('Money:NoMoney');
    }
};

BranchManager.prototype.doUnlock = function(country) {
    this.entity.sound.play('CashComplete');
    this.entity.sound.play('Successful');

    Utils.setItem('Branch_' + country, 'Unlocked');
    this.app.fire('Country:Switch', country);
};

BranchManager.prototype.switchBranch = function(name) {
    if(pc.CountryName == name){
        this.app.fire('Popup:Hide', 'CountryPopup');
        return false;
    }

    pc.CountryName = name;

    this.app.fire('Timeline:Transition', {
        isReverse : true
    });

    this.app.fire('Popup:Hide', 'CountryPopup');

    this.app.fire('Player:Stop');
    this.app.fire('Player:ClearCarry');

    //Use window.setTimeout (real wallclock time) instead of Timer.setTimeout (which is gated
    //by pc.app.timeScale via dt scaling). If timeScale drops to 0 — e.g. during a Poki
    //commercialBreak interstitial that fires when the country popup closes — Timer.setTimeout
    //pauses, the swap never completes, and the old branch's CustomerManager keeps spawning
    //customers there for the duration of the ad. Real-time keeps the swap independent of any
    //game-pause state.
    var self = this;
    window.setTimeout(function(){
        self.setBranch(name);
    }, 1000);
};

BranchManager.prototype.setBranch = function(name) {
    for(var i = 0; i < this.branches.length; i++) {
        var b = this.branches[i];
        if(!b) continue;
        if(b.name === name) {
            b.enabled = true;
            this.buttons[i].element.opacity = 1;

            var playerPosition = b.findByName('PlayerSpawn');

            this.playerEntity.setPosition(playerPosition.getPosition().clone());
        } else {
            b.enabled = false;
            this.buttons[i].element.opacity = 0;
        }
    }

    //reset request
    pc.RequestNumber = false;

    this.app.fire('Timeline:Transition');
    this.app.fire('Table:Reset');

    this.app.fire('BranchManager:Switched', name);
};