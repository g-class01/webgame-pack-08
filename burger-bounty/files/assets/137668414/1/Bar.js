var Bar = pc.createScript('bar');

Bar.prototype.initialize = function() {
    this.app.on('Bar:' + this.entity.name, this.setBarPercentage, this);

    this.on('destroy', this.onDestroy, this);
};

Bar.prototype.onDestroy = function() {
    this.app.off('Bar:' + this.entity.name, this.setBarPercentage, this);
};

Bar.prototype.setBarPercentage = function(scale) {
    this.entity.setLocalScale(Math.max(Math.min(scale, 1), 0), 1, 1);
};