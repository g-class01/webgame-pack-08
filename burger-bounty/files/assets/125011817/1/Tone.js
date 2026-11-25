var Tone = pc.createScript('tone');

Tone.attributes.add('offset', { type : 'number', default : 0.5 });
Tone.attributes.add('scale', { type : 'number', default : 0.5 });
Tone.prototype.initialize = function() {
    this.on('state', this.onStateChange, this);
};

Tone.prototype.onStateChange = function(state) {
    if(state){
        this.entity.sound.play('Tone');
        this.entity.sound.play('TickTock');
    }else{
        this.entity.sound.stop('Tone');
        this.entity.sound.stop('TickTock');
    }
};

Tone.prototype.update = function(dt) {
    var scale = this.entity.getLocalScale().x;

    this.entity.sound.pitch = scale * this.scale + this.offset;
};