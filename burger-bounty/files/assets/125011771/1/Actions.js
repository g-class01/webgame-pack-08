var Actions = pc.createScript('actions');

Actions.prototype.initialize = function() {
    this.entity.on('Money:Add', this.onMoneyAdd, this);
};

Actions.prototype.onMoneyAdd = function(number) {
    this.app.fire('Money:Add', number);
};