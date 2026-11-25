var TableManager = pc.createScript('tableManager');

TableManager.attributes.add('tables', {
    type: 'entity',
    array: true
});

//stations, array entity
TableManager.attributes.add('stations', {
    type: 'entity',
    array: true
});

TableManager.prototype.initialize = function() {
    //disable all tables
    for (var i = 0; i < this.tables.length; i++) {
        this.tables[i].enabled = false;
    }

    //disable all stations
    for (var i = 0; i < this.stations.length; i++ ) {
        this.stations[i].enabled = false;
    }

    //enable first station
    this.stations[0].enabled = true;
    this.stationIndex = 0;

    this.isTutorialCompleted = false;

    if(Utils.getItem('Tutorial') == 'Completed'){
        this.isTutorialCompleted = true;
    }

    this.onStateChange(true);
    this.on('state', this.onStateChange, this);
    this.on('destroy', this.onDestroy, this);
};

TableManager.prototype.onStateChange = function(state) {
    if(state === true){
        this.app.on('Create:Table', this.onCreateTable, this);
        this.app.on('Tutorial:Complete', this.onTutorialCompleted, this);
    }else{
        this.app.off('Create:Table', this.onCreateTable, this);
        this.app.off('Tutorial:Complete', this.onTutorialCompleted, this);
    }
};

TableManager.prototype.onDestroy = function() {
    this.onStateChange(false);
};

TableManager.prototype.onTutorialCompleted = function() {
    this.isTutorialCompleted = true;
};

TableManager.prototype.onCreateTable = function(tableNumber) {
    this.tables[tableNumber].enabled = true;
    this.stationIndex++;
};

TableManager.prototype.update = function() {
    if(this.isTutorialCompleted){
        /*
        if(this.stations[this.stationIndex]){
            this.stations[this.stationIndex].enabled = true;
        }
        */
    }
};