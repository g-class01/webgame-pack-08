var CustomBoost = pc.createScript('customBoost');

CustomBoost.prototype.initialize = function() {
    if(this.entity.name == 'CarryFix'){
        this.app.fire('Station:SetUpgrade', 'Carry', 6);
    }
};