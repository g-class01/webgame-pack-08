var MusicManager = pc.createScript('musicManager');

MusicManager.prototype.initialize = function() {
    this.durations = [73, 84];
    this.musicIndex = 0;

    this.currentDuration = this.durations[0] * 1000;
    this.currentStart = Date.now();
    this.playNextSong();

    this.defaultVolume = parseFloat(this.entity.sound.volume + '');

    this.app.on('MusicManager:Pitch', this.setPitch, this);
    this.app.on('MusicManager:Mute', this.mute, this);
};

MusicManager.prototype.setPitch = function(pitch) {
    this.entity.sound.pitch = pitch;
};

MusicManager.prototype.playNextSong = function() {
    this.musicIndex++;

    this.entity.sound.play('Music-' + this.musicIndex);

    if(this.musicIndex >= 2){
        this.musicIndex = 1;
    }

    var duration = this.durations[this.musicIndex - 1];

    this.currentDuration = duration;
    this.currentStart = Date.now();
};

MusicManager.prototype.mute = function() {
    if(pc.app.systems.sound.volume === 0){
        pc.app.systems.sound.volume = this.defaultVolume;
    } else {
        pc.app.systems.sound.volume = 0;
    }
};

MusicManager.prototype.update = function(dt) {
    if(Date.now() - this.currentStart > this.currentDuration * 1000){
        this.playNextSong();
    }
};