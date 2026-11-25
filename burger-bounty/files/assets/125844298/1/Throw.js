var Throw = pc.createScript('throw');

Throw.attributes.add('throwables', { type: 'entity', array: true });
Throw.prototype.initialize = function() {
    //throw event
    this.app.on('Throw', this.onThrow, this);
    this.app.on('ThrowDisable', this.onThrowDisable, this);

    this.app.on('PlayFastWhoosh', this.playFastWhoosh, this);

    //disable all throwables
    this.throwables.forEach(function(throwable){
        throwable.enabled = false;
    });
};

Throw.prototype.playFastWhoosh = function() {
    this.entity.sound.play('FastThrow');
};

Throw.prototype.onThrowDisable = function(name, time) {
    this.throwables.forEach(function(throwable){
        throwable.enabled = false;
    });
};

Throw.prototype.onThrow = function(name, time) {
    //enable by name and play motion throw
    for (var i = 0; i < this.throwables.length; i++) {
        if (this.throwables[i].name === name) {
            this.throwables[i].enabled = true;
            this.app.fire('Motion', 'Throw');

            this.entity.sound.play('Whoosh');

            //disable 1.5 seconds later
            clearTimeout(this.throwTimer);
            this.throwTimer = setTimeout(function(throwEntity){
                pc.app.fire('Motion', 'LittleShake');
                throwEntity.enabled = false;
            }, time, this.throwables[i]);
        }
    }
};