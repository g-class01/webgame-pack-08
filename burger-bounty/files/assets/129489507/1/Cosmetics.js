var Cosmetics = pc.createScript('cosmetics');

Cosmetics.attributes.add('popupEntity', { type : 'entity' });
Cosmetics.attributes.add('showroomEntity', { type : 'entity' });
Cosmetics.attributes.add('playerEntity', { type : 'entity' });
Cosmetics.attributes.add('outPosition', { type : 'entity' });
Cosmetics.prototype.initialize = function() {
    //this.entity.on('Trigger', this.onTrigger, this);

    this.app.on('Cosmetics:Open', this.onOpen, this);
    this.app.on('Popup:Hide', this.onPopupHide, this);
    this.app.on('Reset:All', this.reset, this);
};

Cosmetics.prototype.reset = function() {
    //ensure showroom + collision are reset; PopupManager owns the wrapper enabled flag
    this.onPopupHide('Cosmetics');
};

Cosmetics.prototype.onOpen = function() {
    this.popupEntity.enabled = true;
    this.showroomEntity.enabled = true;

    this.entity.collision.enabled = false;

    this.app.fire('Popup:Open', this.playerEntity);
};

Cosmetics.prototype.onPopupHide = function(name) {
    if (name !== 'Cosmetics') return;

    this.showroomEntity.enabled = false;
    this.entity.collision.enabled = true;
};