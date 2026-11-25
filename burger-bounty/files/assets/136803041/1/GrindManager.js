var GrindManager = pc.createScript('grindManager');

GrindManager.attributes.add('stations', { 
    type : 'entity', 
    array : true 
});

GrindManager.prototype.postInitialize = function() {
    //if adblock enabled, we'll make station scripts money value x1.5, they gave us nothing, maybe they can at least increase the engagement
    //seems like they are smart enough to enable adblock...
    if(PokiPlugin.adblock){
        this.stations.forEach(function(station){
            station.script.station.startMoney = parseInt(station.script.station.money * 1.5);
            station.script.station.reset();
        });
    }
};