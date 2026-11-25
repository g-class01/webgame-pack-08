var Table = pc.createScript('table');

//customer entity
Table.attributes.add('customer', {
    type: 'entity'
});

Table.attributes.add('plateEntity', {
    type: 'entity'
});

Table.attributes.add('isDirty', {
    type: 'boolean',
    default : false
});

Table.prototype.initialize = function() {
    this.app.on('Table:Reset', this.onTableReset, this);

    this.app.fire('Customer:RefreshTable');
    this.entity.on('SetDirty', this.setDirty, this);
    this.entity.on('Deliver', this.setDeliver, this);

    this.entity.sound.play('Rank');
    this.entity.sound.play('Whoosh');

    this.app.fire('EffectManager:LandSmoke', this.entity.getPosition());
    this.app.fire('Light:Render');
};

Table.prototype.onTableReset = function() {
    this.plateEntity.enabled = false;
    this.isDirty = false;
};

Table.prototype.setDeliver = function() {
    this.plateEntity.enabled = true;

    this.entity.sound.play('Whoosh');
    this.entity.sound.play('Deliver');
};

Table.prototype.setDirty = function() {
    this.plateEntity.enabled = false;
    
    this.app.fire(
        'Kitchen:DirtyPlate', 
        this
    );

    this.isDirty = true;
};