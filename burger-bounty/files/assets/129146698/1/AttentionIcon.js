var AttentionIcon = pc.createScript('attentionIcon');

AttentionIcon.attributes.add('iconName', { type : 'string' });
AttentionIcon.attributes.add('offset', { type : 'vec3', default : [0, 0.5, 0] });
AttentionIcon.prototype.postInitialize = function() {
    this.attentionDisplay = false;

    this.app.fire(
        'World2Screen:Clone', 
        this.iconName,
        this.entity,
        this.offset,
        this.setDisplay.bind(this)
    );

    this.entity.on('Trigger', this.onTrigger, this);
    this.on('destroy', this.onTrigger, this);
};

AttentionIcon.prototype.onTrigger = function(dt) {
    if(this.attentionDisplay){
        this.attentionDisplay.destroy();
    }
};

AttentionIcon.prototype.setDisplay = function(entity) {
    this.attentionDisplay = entity;
};