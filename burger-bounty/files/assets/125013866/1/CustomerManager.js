var CustomerManager = pc.createScript('customerManager');

CustomerManager.attributes.add('parentEntity', {
    type: 'entity'
});

CustomerManager.attributes.add('customerEntities', {
    type: 'entity',
    array : true
});

CustomerManager.attributes.add('harderCustomerEntities', {
    type: 'entity',
    array : true
});

CustomerManager.attributes.add('happyNumberEntity', {
    type: 'entity'
});

CustomerManager.attributes.add('sadNumberEntity', {
    type: 'entity'
});

CustomerManager.attributes.add('moreCustomersUpgrade', {
    type: 'entity'
});

CustomerManager.prototype.initialize = function() {
    this.onStateChange(true);
    this.on('state', this.onStateChange, this);
    this.on('destroy', this.onDestroy, this);
    this.app.on('Reset:All', this.reset, this);
};

CustomerManager.prototype.reset = function() {
    //destroy spawned customers; they're tagged 'Customer' on their template
    var customers = this.parentEntity.findByTag('Customer');
    for(var i = 0; i < customers.length; i++){
        customers[i].destroy();
    }

    //clear any tables holding a reference to a destroyed customer
    if(this.tables){
        for(var j = 0; j < this.tables.length; j++){
            var t = this.tables[j];
            if(t && t.script && t.script.table){
                t.script.table.customer = null;
            }
        }
    }

    //rebuild listeners + counters + timers via the existing teardown/setup
    this.onStateChange(false);
    this.onStateChange(true);

    if(this.happyNumberEntity && this.happyNumberEntity.element){
        this.happyNumberEntity.element.text = '0';
    }
    if(this.sadNumberEntity && this.sadNumberEntity.element){
        this.sadNumberEntity.element.text = '0';
    }
};

CustomerManager.prototype.onStateChange = function(state) {
    if(state === true){
        this.happyCount = 0;
        this.sadCount = 0;

        pc.gameStartTime = Date.now();

        this.lastCheck = Date.now();

        this.totalTableCount = 0;
        this.lastCustomerCreateTime = Date.now() - 15000;
        this.lastTableClear = Date.now() - 15000;

        this.nextDelay = 1000;
        
        this.app.on('Customer:RefreshTable', this.onTableCreated, this);
        this.app.on('Customer:ResetSpawnTimer', this.resetSpawnTimer, this);
        this.app.on('Customer:Vote', this.setCustomerVote, this);

        Timer.setTimeout(function(self){
            self.onTableCreated();
        }, 500, this);
    }else{
        this.app.off('Customer:RefreshTable', this.onTableCreated, this);
        this.app.off('Customer:ResetSpawnTimer', this.resetSpawnTimer, this);
        this.app.off('Customer:Vote', this.setCustomerVote, this);
    }
};

CustomerManager.prototype.onDestroy = function() {
    this.onStateChange(false);
};

CustomerManager.prototype.resetSpawnTimer = function() {
    this.lastTableClear = Date.now();
};

CustomerManager.prototype.setCustomerVote = function(state) {
    if(state == 'Happy'){
        this.happyCount++;
    }

    if(state == 'Sad'){
        this.sadCount++;
    }

    //set entity texts
    this.happyNumberEntity.element.text = this.happyCount + '';
    this.sadNumberEntity.element.text = this.sadCount + '';
};

CustomerManager.prototype.onTableCreated = function() {
    this.tables = this.parentEntity.findByTag('Table');

    var totalCount = 0;
    this.tables.forEach(function(item){
        if(item.enabled){
            totalCount++;
        }
    });

    this.totalTableCount = totalCount;
};

CustomerManager.prototype.getAvailableTable = function() {
    var output = [];
    var i = this.tables.length;

    while(i--){
        if(
            this.tables[i].enabled && 
            this.tables[i].script &&
            !this.tables[i].script.table.customer &&
            !this.tables[i].script.table.isDirty
        ) {
            output.push(this.tables[i]);
        }
    }

    if(output.length > 0){
        return output[Math.floor(Math.random() * output.length)];
    }

    return false;
};

CustomerManager.prototype.getTotalTableCount = function() {
    var output = 0;
    var i = this.tables.length;

    while(i--){
        if(
            this.tables[i].enabled && 
            this.tables[i].script
        ) {
            output++;
        }
    }

    return output;
};

//Country-specific default request used when a customer falls through to its `defaultRequest`
//(very-first customer of a session and the random-roll fallback in Customer.initialize).
//Without per-country overrides every "first customer" on Japan/Italy asks for a Burger
//because BranchManager.setBranch resets pc.RequestNumber on every branch swap.
CustomerManager.DEFAULT_REQUEST_BY_COUNTRY = {
    USA   : 'Burger',
    Japan : 'Sushi',
    Italy : 'PizzaCheese'
};

CustomerManager.prototype.createCustomer = function() {
    var customerDelayTime = 9000;
    var tableCount = this.getTotalTableCount();
    var customerCount = this.parentEntity.findByTag('Customer').length;

    //https://github.com/OnRushStudio/burger-bounty/issues/80
    //ab testing
    //theory 1
    /*
    if(
        tableCount === 1 &&
        customerCount === 1
    ){
        console.log('Cant send more customers, make sure there is no active customers anymore');
        return false;
    }
    */

    //in certain cases, time can go up, for example more tables
    if(tableCount > 2){
       customerDelayTime = 14000; 
    }

    if(tableCount >= 4){
       customerDelayTime = 13000; 
    }

    if(this.moreCustomersUpgrade && this.moreCustomersUpgrade.enabled){
        customerDelayTime = 3000; 
    }

    if(
        Date.now() - this.lastCustomerCreateTime < customerDelayTime ||
        Date.now() - this.lastTableClear < customerDelayTime
    ){
        return false;
    }

    var availableTable = this.getAvailableTable();
    if(!availableTable){
        return false;
    }

    var customerIndex = 0;

    if(
        Math.random() > 0.85 && 
        Date.now() - pc.gameStartTime > 1000 * 4 * 60
    ){
        customerIndex = 1;
    }

    var customerEntity = false;

    if(
        Math.random() > 0.9 && 
        Date.now() - pc.gameStartTime > 1000 * 60 * 3
    ){
        customerEntity = this.harderCustomerEntities[Math.floor(Math.random() * this.harderCustomerEntities.length)];
    }else{
        customerEntity = this.customerEntities[Math.floor(Math.random() * this.customerEntities.length)];
    }
    
    var customer = customerEntity.clone();

    availableTable.script.table.customer = customer;

    customer.script.customer.target = availableTable;
    customer.script.customer.sitTable = availableTable;

    //Resolve branch-specific references BEFORE enabling the customer (Customer.initialize
    //reads kitchenEntity etc.). The Customer template is shared across all branches with
    //USA-baked references; we re-point them to the current branch's equivalents by name.
    var branch = this.parentEntity;
    var entryExit = null;

    var kitchenMgr = branch.findByName('KitchenManager');
    if(kitchenMgr){
        customer.script.customer.kitchenEntity = kitchenMgr;
    }

    var shop = branch.findByName('Shop');
    if(shop){
        for(var i = 0; i < shop.children.length; i++){
            var c = shop.children[i];
            if(c && c.script && c.script.cashMachine){
                customer.script.customer.cashMachineEntity = c;
                break;
            }
        }
    }

    var street = branch.findByName('Street');
    if(street){
        entryExit = street.findByName('Exit');
        if(entryExit){
            customer.script.customer.doorTarget = entryExit;
        }
    }

    //Per-country defaultRequest. The Customer template's defaultRequest is 'Burger'; when
    //the customer is the "first" of a session OR when the random-want roll produces zero
    //wants, Customer.initialize falls back to defaultRequest. Without this override every
    //first Italy/Japan customer asks for a Burger.
    var countryDefault = CustomerManager.DEFAULT_REQUEST_BY_COUNTRY[pc.CountryName];
    if(countryDefault){
        customer.script.customer.defaultRequest = countryDefault;
    }

    this.parentEntity.addChild(customer);

    //teleport the cloned customer to the current branch's entry door — the template's local
    //position is USA's restaurant entrance, so without this the customer would walk in from
    //USA's door across the world even when playing on Italy / Japan
    if(entryExit){
        customer.setPosition(entryExit.getPosition());
    }

    customer.enabled = true;

    this.app.fire('Scene:Collision');
    this.lastCustomerCreateTime = Date.now();
};

CustomerManager.prototype.update = function() {
    //Skip customer spawning when the game is paused (timeScale=0 from the explicit
    //pause overlay or an ad) or when a popup/menu is open (pc.hasActivePopup).
    //createCustomer throttles via Date.now() which is real-time, so without this
    //gate it keeps minting customers while the player is paused / watching an ad /
    //browsing a menu / mid-branch-swap.
    if(this.app.timeScale === 0 || pc.hasActivePopup){
        return false;
    }

    if(this.totalTableCount > 0 && Date.now() - this.lastCheck > 1000) {
        this.createCustomer();
        this.lastCheck = Date.now();
    }
};