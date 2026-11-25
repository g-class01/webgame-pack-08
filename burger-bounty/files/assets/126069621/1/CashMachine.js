var CashMachine = pc.createScript('cashMachine');

CashMachine.attributes.add('waitPoints', { type : 'entity', array : true });
CashMachine.attributes.add('moneyEntity', { type : 'entity' });
CashMachine.prototype.initialize = function() {
    this.waitingCustomers = [];
    this.currentCustomer  = false;
    this.customerIndex = 0;

    this.currentStack = 0;

    this.currentMoneyIndex = 0.01;

    this.entity.on('Trigger', this.onTrigger, this);
    this.entity.on('Leave', this.onLeave, this);

    this.app.fire('Scene:Triggers');
};

CashMachine.prototype.setCustomer = function(entity) {
    this.customerIndex++;
    
    entity.tags.add(this.customerIndex.toString());
    this.waitingCustomers.push(entity);
};

CashMachine.prototype.getTarget = function(newPositionInLine) {
    if(newPositionInLine){
        return this.waitPoints[newPositionInLine];
    } else {
        return this.waitPoints[this.customerIndex];
    }    
};

CashMachine.prototype.cancelPayment = function(entity) {
    var i = this.waitingCustomers.length;

    if(i > 0) {
        while(i--) {
            if(this.waitingCustomers[i] === entity) {
                this.waitingCustomers.splice(i, 1);
                break;
            }
        }
    }

    //if it's current customer, cancel it
    if(this.currentCustomer === entity) {
        this.currentCustomer = false;
    }

    //decrease customer index
    if(this.customerIndex > 0) {
        this.customerIndex--;
        this.app.fire('CashOrderChanged');
    }
};

CashMachine.prototype.onTrigger = function() {
    if(this.currentCustomer && this.currentCustomer.script && this.currentCustomer.script.customer){
        if(this.currentCustomer.script.customer.isReadyToPay){
            if(this.currentCustomer.script.customer.hasMoney()){
                this.currentStack+=this.currentCustomer.script.customer.getMoney();
                this.currentMoneyIndex+=0.1;

                this.app.fire('Sound:Play', 'MoneyCount');
                this.app.fire('StateTime:Money', 'Add');

                this.lastMoneyCountTime = Date.now();
            }else if(this.currentStack >= 0){
                if(Date.now() - this.lastMoneyCountTime > 500){
                    this.currentStack-=2;
                    this.currentMoneyIndex-=0.1;
                    this.app.fire('Money:Add', 2);

                    this.app.fire('StateTime:Money', 'Remove');   
                }
            }else{
                if(this.customerIndex > 0){
                    this.customerIndex--;     
                    this.app.fire('CashOrderChanged');          
                }

                this.currentMoneyIndex = 0.02;

                this.app.fire('StateTime:Money', 'Default');
                this.app.fire('Sound:Play', 'CashComplete');

                this.app.fire('Cash:State', 'Complete');

                this.currentCustomer.script.customer.leaveHappy();
                this.currentCustomer = false;
            }
        }

        this.moneyEntity.setLocalScale(1, this.currentMoneyIndex * 0.1, 1);

        return false;
    }

    if(this.waitingCustomers.length === 0){
        return false;
    }

    this.currentCustomer = this.waitingCustomers.shift();
};

CashMachine.prototype.onLeave = function() {
    this.app.fire('StateTime:Money', 'Default');
};