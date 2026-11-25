var OptimizedLight = pc.createScript('optimizedLight');

OptimizedLight.prototype.initialize = function() {
    this.app.on('Light:Render', this.onRender, this);
};

OptimizedLight.prototype.onRender = function() {
    this.entity.light.shadowUpdateMode = pc.SHADOWUPDATE_THISFRAME;
};