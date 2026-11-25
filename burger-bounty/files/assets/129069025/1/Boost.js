var Boost = pc.createScript('boost');

Boost.attributes.add('timeEntity', { type : 'entity' });
Boost.prototype.initialize = function() {
    this.time = 10;
    this.lastSecond = 10;
    
    this.on('state', this.onStateChange, this);
    this.entity.on('Trigger', this.onTrigger, this);
};

Boost.prototype.onStateChange = function(state) {
    if(state === true){
        this.time = 10;
        this.lastSecond = 10;
    }
};

Boost.prototype.onTrigger = function() {
    this.app.fire('Player:Boost');
    this.entity.enabled = false;
};

Boost.prototype.update = function(dt) {
    this.time-=dt;

    var second = Math.floor(this.time);

    if(this.lastSecond != second){
        this.entity.sound.play('Tick');
    }

    this.lastSecond = second;
    this.timeEntity.element.text = Utils.mmss(this.time);

    if(this.time <= 0){
        this.entity.enabled = false;
    }
};