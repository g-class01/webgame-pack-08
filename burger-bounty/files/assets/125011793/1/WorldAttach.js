var WorldAttach = pc.createScript('worldAttach');

WorldAttach.attributes.add('type', { type : 'string' });
WorldAttach.attributes.add('offset', { type : 'vec3', default : [0, 0, 0] });
WorldAttach.prototype.initialize = function() {
    this.app.fire(
        'World2Screen:Clone',
        this.type,
        this.entity,
        this.offset,
        this.onSetCallback.bind(this)
    );
};

WorldAttach.prototype.onSetCallback = function(entity) {
    console.log(entity);
};