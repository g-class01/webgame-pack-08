var Waiter = pc.createScript('waiter');

Waiter.attributes.add('waiterType', { type : 'string', default : 'Burger' });
Waiter.attributes.add('baseEntity', { type : 'entity' });
Waiter.attributes.add('kitchenManager', { type : 'entity' });
Waiter.attributes.add('characterEntity', { type : 'entity' });
Waiter.attributes.add('plateWithFood', { type : 'entity' });
Waiter.attributes.add('floatingFood', { type : 'boolean', default : false });

Waiter.prototype.initialize = function() {
    this.isCarry = false;
    this.onBase  = true;
    this.customerIsSelected = false;
    this.selectedCustomer   = false;
    this.plateWithFood.enabled = false;

    this.originalSpeed = parseFloat('' + this.entity.script.pathMove.speed);

    this.entity.on('Waypoint:Reach', this.onWayPoint, this);
    this.entity.on('Station:Upgrade', this.setUpgradeState, this);
};

Waiter.prototype.setUpgradeState = function(level, multiplier) {
    this.entity.script.pathMove.speed = Math.min(this.originalSpeed * multiplier, 0.075);
};

Waiter.prototype.onWayPoint = function(target) {
    if(target.name == this.baseEntity.name){
        this.onBase = true;
    }

    if(
        target.name == 'Customer' || 
        target.name == 'FatCustomer' ||
        target.name == 'JapanCustomer' ||
        target.name == 'ItalyCustomer' ||
        target.name == 'ItalyFatCustomer'
    ){
        this.selectedCustomer.fire('TrigerWaiter', this.entity, this.waiterType);
        this.isCarry = false;
        this.selectedCustomer = false;
        
        this.entity.fire('Waypoint:Target', this.baseEntity);
    }
};

Waiter.prototype.deliver = function() {
    if(
        this.selectedCustomer && 
        this.selectedCustomer.children.length === 0
    ){
        this.selectedCustomer = false;
    }

    if(
        this.selectedCustomer && 
        this.selectedCustomer.script.customer.state == 'Leave'
    ){
        this.selectedCustomer = false;
    }
    
    if(this.selectedCustomer){
        return false;
    }

    this.customerIsSelected = false;
    var customers = this.app.root.findByTag('Customer');

    if(customers.length > 0){
        for(var customerIndex in customers){
            if(!this.customerIsSelected && customers[customerIndex].enabled){
                if(customers[customerIndex].script.customer.getWantByName(this.waiterType) == true){
                    //console.log(customers[customerIndex]);
                    this.entity.fire('Waypoint:Target', customers[customerIndex]);
                    this.onBase = false;
                    this.selectedCustomer   = customers[customerIndex];
                    this.customerIsSelected = true;
                }
            }
        }
    }

    if(!this.customerIsSelected){
        //console.log(this.baseEntity);
        this.entity.fire('Waypoint:Target', this.baseEntity);
    }
};

Waiter.prototype.update = function(dt) {
    //Halt waiter pickup/delivery ticks while a popup is open so the kitchen
    //queue doesn't keep dispatching food under the menu.
    if(pc.hasActivePopup){
        return;
    }
    if(this.isCarry){
        this.characterEntity.anim.setBoolean('Carry', true);
        this.plateWithFood.enabled = true;
        this.deliver();
    } else{
        this.characterEntity.anim.setBoolean('Carry', false);
        this.plateWithFood.enabled = false;

        if(this.onBase){
            totalFoodTypeCount = this.kitchenManager.script.kitchenManager.totalFoodCountByName(this.waiterType);

            if(this.floatingFood){
                totalFoodTypeCount = 1;
            }

            if(totalFoodTypeCount > 0){
                this.isCarry = true;
                var placePoint = this.app.root.findByName(this.waiterType + 'PlacePoint' + totalFoodTypeCount);
                
                if(
                    placePoint && 
                    placePoint.children && 
                    placePoint.children.length > 0
                ){
                    placePoint.children[0].destroy();   
                }
            }          
        }
    }  
};
