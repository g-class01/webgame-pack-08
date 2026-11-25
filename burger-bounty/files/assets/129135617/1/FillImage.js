var FillImage = pc.createScript('fillImage');

FillImage.prototype.initialize = function() {
    this.progress = 0;
    this.entity.on('SetProgress', this.setProgress, this);
};

FillImage.prototype.setProgress = function(progress) {
    this.progress = progress;
};

FillImage.prototype.update = function(dt) {
    this.entity.element.rect.w = this.progress;
    this.entity.element.height = this.progress * 100;
};