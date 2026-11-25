var Sound = pc.createScript('sound');

Sound.prototype.initialize = function() {
    this.app.on('Sound:Play', this.playSound, this);
};

Sound.prototype.playSound = function(name) {
    this.entity.sound.play(name);
};