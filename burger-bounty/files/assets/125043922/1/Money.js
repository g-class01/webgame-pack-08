var Money = pc.createScript('money');

//amount of money
Money.attributes.add('amount', {
    type: 'number',
    default: 100
});

Money.prototype.initialize = function() {
    this.entity.on('Trigger', this.onTrigger, this);
    this.app.fire('Scene:Triggers');
};

Money.prototype.onTrigger = function() {
    this.app.fire('Money:Add', this.amount);
    this.entity.destroy();
};