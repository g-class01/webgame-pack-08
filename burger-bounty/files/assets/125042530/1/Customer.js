var Customer = pc.createScript('customer');

//target is the place where customer will go
Customer.attributes.add('isFat', {type: 'boolean', default : false});
Customer.attributes.add('target', {type: 'entity'});
Customer.attributes.add('characterEntity', {type: 'entity'});
Customer.attributes.add('rigEntity', {type: 'entity'});
Customer.attributes.add('doorTarget', {type: 'entity'});
Customer.attributes.add('cashMachineEntity', {type: 'entity'});
Customer.attributes.add('kitchenEntity', {type: 'entity'});
Customer.attributes.add('modelEntity', {type: 'entity'});
Customer.attributes.add('sitTable', {type: 'entity'});
Customer.attributes.add('speed', {type: 'number', default: 0.1});
Customer.attributes.add('turnSpeed', {type: 'number', default: 0.1});
Customer.attributes.add('defaultRequest', { type: 'string', default: 'Burger' });

Customer.attributes.add('cokeEntity', {type: 'entity'});
Customer.attributes.add('burgerEntity', {type: 'entity'});
Customer.attributes.add('iceCreamEntity', {type: 'entity'});

Customer.prototype.initialize = function() {
    var isFirstCustomer = false;

    this.offset = new pc.Vec3(0, 2.0, 0);
    this.lastDropAllow = -1;

    this.state = 'Sit';
    this.isReadyToPay = false;
    this.targetCashMachine = false;

    this.direction = 0;
    this.nextDirection = 0;

    this.options = this.kitchenEntity.script.kitchenManager.getAvailableOptions();
    //this.wants = this.options[Math.floor(Math.random() * this.options.length)];

    this.pieceItems = [];
    this.wants = [];

    var customers = this.app.root.findByTag('Customer');
    var totalRequestCount = 0;

    for(var index in customers){
        var customer = customers[index];

        if(customer && customer.enabled){
            totalRequestCount+=customer.script.customer.wants.length;
        }
    }

    var randomChance = 0.2;

    if(totalRequestCount >= 3){
        randomChance = 0.5;
    }

    if(totalRequestCount >= 5){
        randomChance = 0.75;
    }

    if(totalRequestCount >= 7){
        randomChance = 0.85;
    }

    for(var optionIndex in this.options){
        var option = this.options[optionIndex];

        if(Math.random() > randomChance  && option){
            var totalAmount = 1;

            if(Math.random() > 0.2){
                totalAmount = 1 + Math.floor(Math.random() * 1);
            }

            if(option == 'Coke'){
                totalAmount = 1;
            }

            this.wants.push({
                name : option,
                amount : totalAmount
            });
        }
    }

    if(this.wants.length === 0){
        var amount = 1 + Math.floor(Math.random() * 3);

        //https://github.com/OnRushStudio/burger-bounty/issues/80
        //for the first 3 minutes, don't increase the request size
        if(Date.now() - pc.gameStartTime < 1000 * 60 * 2){
            amount = 1;
        }

        this.wants = [
            {
                name : this.defaultRequest,
                amount : amount
            }
        ];
    }

    if(!pc.RequestNumber){
        pc.RequestNumber = 'Set';
        isFirstCustomer  = true;
        
        this.howManyPieces = 1;

        this.wants = [
            {
                name : this.defaultRequest,
                amount : 1
            }
        ];
    }else{
        //get total wants amount for this.howManyPieces
        this.howManyPieces = 0;

        for(var i=0; i< this.wants.length; i++){
            this.howManyPieces += this.wants[i].amount;
        }
    }

    if(this.isFat){
        this.sadLeaveTime  = 150;
    }else{
        this.sadLeaveTime  = 45 + this.howManyPieces * 10;
    }
    
    this.howLongWait = this.howManyPieces * 6500;
    this.money = this.howManyPieces * 10;

    if(isFirstCustomer){
        this.sadLeaveTime = 150;
        this.howLongWait = 4000;
    }

    if(this.isFat){
        this.money*=2;
    }

    this.wantDisplay = false;

    this.entity.on('Trigger', this.onTrigger, this);
    this.entity.on('TrigerWaiter', this.onTrigerWaiter, this);
    this.characterEntity.anim.on('Sound', this.playSound, this);
    this.on('destroy', this.onDestroy, this);

    /*
    if(!this.isFat){
        var self = this;
        var assetCount   = this.app.assets.findByTag(pc.CountryName + '-Character').length;
        var randomNumber = Math.floor(Math.random() * assetCount) + 1;

        var asset = this.app.assets.find(pc.CountryName + '-' + randomNumber);

        asset.ready(function(resource){
            // self.rigEntity.render.asset = resource;
        });

        this.app.assets.load(asset);
    }
    */

    //Customer rigEntity is bound to the CasualChar skeleton. USA-1..5 meshes are rigged
    //against that same skeleton, but Italy-N and Japan-N meshes live in a different glb
    //container (woman-casual_Rig) with a different bone hierarchy — swapping them onto
    //the existing rigEntity binds the mesh to the wrong skeleton and renders invisibly /
    //incorrectly. So we always pick from USA-N here regardless of pc.CountryName, until
    //per-country meshes get re-rigged onto the CasualChar skeleton OR each branch gets
    //its own Customer template.
    var modelName = 'USA-' + Math.round(pc.math.random(1, 5));
    var mesh = this.app.assets.find(modelName, 'render');
    var material = this.app.assets.find(modelName, pc.ASSET_MATERIAL);

    this.rigEntity.render.asset = mesh;
    this.rigEntity.render.materialAssets = [material];

    this.app.fire('Scene:Triggers');

    Timer.setTimeout(function(){
        pc.app.fire('Motion', 'Open');
        pc.app.fire('Sound:Play', 'DoorBell');
    }, 1200);

    // 2
    this.app.on('CashOrderChanged', this.onCashOrderChanged, this);
    this.app.on('BranchManager:Switch', this.onBranchChange, this);
};

Customer.prototype.onBranchChange = function(data){
    Timer.clearTimeout(this.sadLeaveTimer);
    Timer.clearTimeout(this.eatTimer);
    Timer.clearTimeout(this.finishEatingTimer);

   
    this.entity.destroy();
    this.sitTable.script.table.customer = false;
    
};

Customer.prototype.playSound = function(data){
    this.entity.sound.play(data.string + '-' + (Math.floor(Math.random()) + 1));
};

Customer.prototype.onCashOrderChanged = function(){
    if(this.state == 'Leave'){
        return false;
    }
    
    if(this.targetCashMachine){
        //3rd tag is the tag that defines their order
        var tagIndex = 3;
        var newPositionInLine = Number(this.entity.tags.list()[tagIndex]) - 1;
        this.entity.tags.list()[tagIndex] = newPositionInLine.toString();
        this.target = this.cashMachineEntity.script.cashMachine.getTarget(newPositionInLine);
    }
    
};

Customer.prototype.onDestroy = function() {
    this.app.off('CashOrderChanged', this.onCashOrderChanged, this);
    this.app.off('BranchManager:Switch', this.onBranchChange, this);

    if(this.wantDisplay){
        this.wantDisplay.destroy();
    }

    if(this.paymentDisplay){
        this.paymentDisplay.destroy();
    }

    this.entity.off('CashOrderChanged', this.onCashOrderChanged, this);

    Timer.clearTimeout(this.sadLeaveTimer);
};

Customer.prototype.getTotalNumber = function() {
    var output = 0;

    for(var i = 0; i< this.wants.length; i++){
        output += this.wants[i].amount;
    }

    return output;
};

Customer.prototype.onTrigerWaiter = function(entity, type) {
    for(var index in this.wants){
        if(this.wants[index].name == type){
            this.wants[index].amount--;

            entity.fire('Drop', this.wants[index].name);
            
            this.app.fire('Deliver', this.wants[index].name);
            this.sitTable.fire('Deliver');

            this.updateItems();
            
            if(this.getTotalNumber() <= 0){
                this.completeRequest();
            }
        }
    }
};

Customer.prototype.onTrigger = function(entity) {
    if(this.state == 'Leave'){
        return false;
    }

    if(this.state == 'Pay'){
        return false;
    }

    if(this.state == 'Sit'){
        return false;
    }

    if(Date.now() - this.lastDropAllow < 200){
        return false;
    }

    var hasGarbage = entity.script.carries.hasCarryByName('Garbage');

    if(hasGarbage){
        this.leave();
        return false;
    }

    var whichCarryWanted = entity.script.carries.hasCarryByNameAny(this.wants);

    if(!whichCarryWanted){
        return false;
    }

    if(whichCarryWanted.amount <= 0){
        return false;
    }

    whichCarryWanted.amount--;

    //pay money
    //generate money
    entity.fire('Drop', whichCarryWanted.name);
    
    this.app.fire('Deliver', whichCarryWanted.name);
    this.sitTable.fire('Deliver');

    this.updateItems();
    
    if(this.getTotalNumber() <= 0){
        this.completeRequest();
    }

    this.lastDropAllow = Date.now();
};

Customer.prototype.hasCoke = function() {
    var output = false;

    for(var index in this.wants){
        var want = this.wants[index];

        if(want.name == 'Coke'){
            output = true;
        }
    }

    return output;
};

Customer.prototype.hasIceCream = function() {
    var output = false;

    for(var index in this.wants){
        var want = this.wants[index];

        if(want.name == 'IceCream'){
            output = true;
        }
    }

    return output;
};

Customer.prototype.completeRequest = function() {
    if(this.hasIceCream()){
        this.characterEntity.anim.setTrigger('IceCream');
        
        //enable coke disable coke
        this.iceCreamEntity.enabled = true;
    }else if(this.hasCoke()){
        this.characterEntity.anim.setTrigger('Drink');
        
        //enable coke disable coke
        this.cokeEntity.enabled = true;
    }else{
        this.characterEntity.anim.setTrigger('Eat');
        this.burgerEntity.enabled = true;
    }

    this.state = 'Pay';

    Timer.clearTimeout(this.sadLeaveTimer);

    //entity.script.movement.isCarrying
    if(this.wantDisplay){
        this.wantDisplay.destroy();
    }

    //eating the meal — pausable so the timer freezes when a menu opens
    //instead of firing goToPay() under the popup
    this.eatTimer = Timer.setTimeoutPausable(function(self){
        self.goToPay();
    }, this.howLongWait, this);
};

Customer.prototype.leaveHappy = function() {
    if(this.paymentDisplayState){
        this.paymentDisplayState.element.textureAsset = this.app.assets.find('Happy-Icon.png');
    }
    
    this.app.fire('Customer:Vote', 'Happy');
    this.leaveShop();
};

Customer.prototype.readyToPay = function() {
    this.isReadyToPay = true;
    this.characterEntity.anim.setTrigger('Stop');

    this.entity.sound.play('Ready');

    this.app.fire(
        'World2Screen:Clone', 
        'Pay',
        this.entity,
        this.offset,
        this.setPaymentDisplay.bind(this)
    );

    this.setSadLeaveTimer(this.sadLeaveTime);
};

Customer.prototype.walk = function() {
    if(this.characterEntity && this.characterEntity.anim){
        this.characterEntity.anim.setTrigger('Walk');
        this.characterEntity.setLocalPosition(0, 0, 0);
    }
};

Customer.prototype.sit = function() {
    if(this.characterEntity && this.characterEntity.anim){
        this.characterEntity.anim.setTrigger('Sit');
    }

    if(Math.random() > 0.5){
        this.characterEntity.setLocalPosition(0, 0.2, 1.05);
        this.modelEntity.setLocalEulerAngles(0, -90, 0);
    }else{
        this.characterEntity.setLocalPosition(0, 0.2, 0.85);
        this.modelEntity.setLocalEulerAngles(0, 90, 0);
    }
};

Customer.prototype.goToPay = function() {
    this.app.fire('Customer:ResetSpawnTimer');
    this.sitTable.fire('SetDirty');
    this.sitTable.script.table.customer = false;

    this.cokeEntity.enabled   = false;
    this.burgerEntity.enabled = false;

    //finish-eating delay — pausable so the customer doesn't jump to the
    //cash machine while a popup is open
    this.finishEatingTimer = Timer.setTimeoutPausable(function(self){
        self.cashMachineEntity.script.cashMachine.setCustomer(self.entity);
        self.walk();
        self.targetCashMachine = true;
        self.target = self.cashMachineEntity.script.cashMachine.getTarget();
    }, 1800, this);
};

Customer.prototype.leaveShop = function() {
    this.state = 'Leave';
    this.walk();
    this.target = this.doorTarget;
};

Customer.prototype.hasMoney = function() {
    return this.money >= 2;
};

Customer.prototype.getMoney = function() {
    this.money-=2;

    return 2;
};

Customer.prototype.showRequest = function() {
    /*
    this.app.fire(
        'World2Screen:Clone', 
        'Wait',
        this.entity,
        this.offset,
        this.setWaitDisplay.bind(this)
    );
    */

    this.app.fire(
        'World2Screen:Clone', 
        'Want',
        this.entity,
        this.offset,
        this.setDisplay.bind(this)
    );

    this.entity.sound.play('Notify');

    this.state = 'Wait';

    //leave them after 45 seconds
    this.setSadLeaveTimer(this.sadLeaveTime);
};

Customer.prototype.setSadLeaveTimer = function(time) {
    Timer.clearTimeout(this.sadLeaveTimer);
    //pausable: the patience countdown freezes when a popup opens, so the
    //customer doesn't rage-leave while the player is reading a menu
    this.sadLeaveTimer = Timer.setTimeoutPausable(function(self){
        self.leave();
    }, time * 1000, this);
};

Customer.prototype.leave = function(data) {
    this.walk();

    if(this.wantDisplay){
        this.wantDisplay.destroy();
    }
    
    this.state  = 'Leave';

    this.wants = [
        {
            name : 'Sad',
            amount : -1
        }
    ];

    this.app.fire('Customer:Vote', 'Sad');

    this.entity.sound.play('Fail');
    
   
    if(this.isReadyToPay){
        this.cashMachineEntity.script.cashMachine.cancelPayment(this.entity);
        
        if(this.paymentDisplayState){
            this.paymentDisplayState.element.textureAsset = this.app.assets.find('Sad-Icon.png');
        }
    }else{
        this.app.fire(
            'World2Screen:Clone', 
            'Want',
            this.entity,
            this.offset,
            this.setDisplay.bind(this)
        );

        this.sitTable.script.table.customer = false;
    }

    this.target = this.doorTarget;
};

Customer.prototype.update = function(dt) {
    //Freeze customer movement + state transitions while a popup/menu is open
    //so arrivals don't keep walking, sitting, paying, or leaving underneath
    //the UI. The Timer-driven countdowns (eatTimer, sadLeaveTimer,
    //finishEatingTimer) are gated separately in TimerPolyfill.onUpdate.
    if(pc.hasActivePopup){
        return;
    }

    var distance = 1.0;

    if(this.target){
        distance = this.entity.getPosition().sub(this.target.getPosition()).length();

        //set direction to target
        var position = this.entity.getPosition();
        var targetPosition = this.target.getPosition();

        this.nextDirection = Utils.lookAt(
            position.x, position.z, 
            targetPosition.x, targetPosition.z
        );

        this.direction = Utils.rotate(
            this.direction,
            this.nextDirection,
            this.turnSpeed
        ); 

        if(distance > 0.1) {
            this.entity.translateLocal(
                Math.sin(this.direction) * this.speed * dt,
                0,
                Math.cos(this.direction) * this.speed * dt
            );
        }

        //look at target
        this.modelEntity.lookAt(this.target.getPosition());
    }

    if(distance <= 0.25 && this.target){
        if(this.state == 'Sit'){
            this.sit();

            this.showRequest();
        }

        if(this.state == 'Pay'){
            if(!this.isReadyToPay){
                this.readyToPay();
            }
        }

        if(this.state == 'Leave'){
            if(this.paymentDisplay){
                this.paymentDisplay.destroy();
            }

            this.app.fire('Customer:Leave');
            this.entity.destroy();
        }

        //clear target
        this.target = false;
    }
};

Customer.prototype.setDisplay = function(entity) {
    /*
    entity.findByName('Icon').element.textureAsset = this.app.assets.find(this.wants + '-Icon.png');
    entity.findByName('Number').element.text = this.howManyPieces + '';
    */

    this.wantDisplay = entity;
    this.backgroundEntity = entity.findByName('Background');
    this.pieceItem   = entity.findByName('Item');
    this.pieceHolder = entity.findByName('ContentHolder');

    this.barEntity = entity.findByName('Bar');

    this.pieceItem.enabled = false;

    this.updateItems();

    entity.findByName('Fat').enabled = this.isFat;

    if(this.barEntity && this.state == 'Leave'){
        this.barEntity.destroy();
    }
};

Customer.prototype.updateItems = function() {
    var i = this.pieceItems.length;

    while(i--){
        if(this.pieceItems[i]){
            this.pieceItems[i].destroy();
        }
    }

    this.pieceItems = [];

    for(var index in this.wants){
        var want = this.wants[index];
        var pieceItem = this.pieceItem.clone();

        if(want.amount > 0){
            pieceItem.enabled = true;

            var iconEntity = pieceItem.findByName('Icon');

            if(iconEntity){
                iconEntity.element.textureAsset = this.app.assets.find(want.name + '-Icon.png');
                pieceItem.findByName('Number').element.text = want.amount + '';
            }

            this.pieceHolder.addChild(pieceItem);
            this.pieceItems.push(pieceItem);
        }else if(want.amount === -1){
            pieceItem.enabled = true;

            var iconEntity = pieceItem.findByName('Icon');

            if(iconEntity){
                iconEntity.element.textureAsset = this.app.assets.find(want.name + '-Icon.png');
                pieceItem.findByName('Number').enabled = false;
            }

            this.pieceHolder.addChild(pieceItem);
            this.pieceItems.push(pieceItem);
        }
    }

    if(
        this.backgroundEntity && 
        this.backgroundEntity.element &&
        this.backgroundEntity.element.width > 0
    ){
        this.backgroundEntity.element.width = this.pieceItems.length * 80;
    }

    if(
        this.wantDisplay &&
        this.wantDisplay.element &&
        this.wantDisplay.element.width > 0
    ){
        this.wantDisplay.element.width = this.pieceItems.length * 90 + 40;
    }
};

Customer.prototype.getWantByName = function(name){
    if(this.state != 'Wait'){
        return false;
    }

    var output = false;

    for(var index in this.wants){
        var want = this.wants[index];

        if(want.name == name && want.amount > 0){
            output = true;
        }
    }

    return output;
};


Customer.prototype.setPaymentDisplay = function(entity) {
    this.paymentDisplay = entity;
    this.paymentDisplayState = entity.findByName('Icon');
    this.paymentDisplayTimer = entity.findByName('Bar');
};