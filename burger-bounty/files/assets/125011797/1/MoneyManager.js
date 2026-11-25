var MoneyManager = pc.createScript('moneyManager');

MoneyManager.attributes.add('startMoney', { type : 'number', default : 500 });
MoneyManager.attributes.add('moneyColor', { type : 'entity' });
MoneyManager.attributes.add('noMoneyAlert', { type : 'entity' });
MoneyManager.attributes.add('moneyEntity', { type : 'entity' });
MoneyManager.attributes.add('bankEntity', { type : 'entity' });
MoneyManager.attributes.add('countryMoney', { type : 'entity', array : true });
MoneyManager.attributes.add('playerEntity', { type : 'entity' });
MoneyManager.attributes.add('collectableMoneyEntity', { type : 'entity' });
MoneyManager.prototype.initialize = function() {
    this.money = this.startMoney;
    this.totalMoney = this.startMoney;
    this.lastMoneySave = -1;

    if(Utils.getItem('Money')){
        this.money = parseInt(Utils.getItem('Money'));
    }

    //prevent any potential bug
    var tutorialIndex = Utils.getItem('TutorialIndex');

    if(tutorialIndex && parseInt(tutorialIndex) < 2){
        this.money = this.startMoney;
    }else if(tutorialIndex && parseInt(tutorialIndex) === 2){
        this.money = 30;
    }

    this.app.on('Money:Remove', this.remove, this);
    this.app.on('Money:Add', this.add, this);
    this.app.on('Money:Has', this.has, this);
    this.app.on('Money:Drop', this.drop, this);
    this.app.on('Money:NoMoney', this.showNoMoney, this);

    this.updateMoney();

    pc.MoneyManager = this;
};

MoneyManager.prototype.drop = function(position, amount) {
    var collectableMoney = this.collectableMoneyEntity.clone();

    collectableMoney.setPosition(
        position.x + Math.random() * 4 - Math.random() * 4,
        0,
        position.z + Math.random() * 4 - Math.random() * 4
    );
    collectableMoney.script.money.amount = amount;
    collectableMoney.enabled = true;

    this.app.root.addChild(collectableMoney);
};

MoneyManager.prototype.showNoMoney = function() {
    if(!this.noMoneyAlert.enabled){
        this.noMoneyAlert.enabled = true;
        this.noMoneyTimer = setTimeout(function(self){
            self.noMoneyAlert.enabled = false;
        }, 1000, this);
    }
};

MoneyManager.prototype.has = function(money, callback, error) {
    var value = parseInt(money);

    if(this.money >= value){
        if(callback){
            callback();
        }
    }else{
        if(error){
            error();
        }
    }
};

MoneyManager.prototype.remove = function(money) {
    if(money <= this.money){
        this.money-=parseInt(money);
    }
    
    this.updateMoney();

    this.app.fire('Sound:Play', 'MoneyCount');

    //this.app.fire('DealtDamage:Trigger', money, this.playerEntity.getPosition(), true);
};

MoneyManager.prototype.add = function(money) {
    this.money+=parseInt(money);
    this.totalMoney+=parseInt(money);
    this.updateMoney();

    this.app.fire('Sound:Play', 'MoneyCount');

    //this.app.fire('DealtDamage:Trigger', money, this.playerEntity.getPosition());
};

MoneyManager.prototype.updateMoney = function() {
    this.moneyEntity.element.text = this.money + '';
    this.bankEntity.element.text = this.totalMoney + '';

    if(Date.now() - this.lastMoneySave > 1000){
        Utils.setItem('Money', this.money);
        this.lastMoneySave = Date.now();
    }

    if(this.money <= 0){
        this.moneyColor.element.color = pc.Color.RED;
    }else{
        this.moneyColor.element.color = pc.Color.GREEN;
    }

    //update countryMoney
    for(var index in this.countryMoney){
        var moneyEntity = this.countryMoney[index];

        if(moneyEntity.name == 'USA'){
            moneyEntity.element.text = '$' + this.money;
        }
    }
};