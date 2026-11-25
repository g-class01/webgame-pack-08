var PopupManager = pc.createScript('popupManager');

PopupManager.prototype.initialize = function () {
    this.playerEntity = this.app.root.findByName('Player');

    this.app.on('Popup:Show', this.onShow, this);
    this.app.on('Popup:Hide', this.onHide, this);

    this.on('destroy', function () {
        this.app.off('Popup:Show', this.onShow, this);
        this.app.off('Popup:Hide', this.onHide, this);
    }, this);
};

PopupManager.prototype.onShow = function (name) {
    var children = this.entity.children;
    for (var i = 0; i < children.length; i++) {
        children[i].enabled = (children[i].name === name);
    }
    this.app.fire('Popup:Open', this.playerEntity);
};

PopupManager.prototype.onHide = function (name) {
    var target = this.entity.findByName(name);
    if (target) target.enabled = false;
    this.app.fire('Popup:Close', this.playerEntity);
};
