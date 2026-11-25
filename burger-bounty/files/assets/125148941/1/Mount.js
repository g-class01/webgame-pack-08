var Mount = pc.createScript('mount');

Mount.attributes.add('event', { type : 'string' });
Mount.prototype.initialize = function() {
    this.app.fire(this.event);
};