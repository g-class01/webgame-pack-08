var Switch = pc.createScript('switch');

Switch.prototype.initialize = function() {
    this.options = this.entity.findByTag('Option');

    this.options.forEach(function(entity){
        entity.enabled = false;
    });

    this.entity.on('Drop', this.onDrop, this);
};

Switch.prototype.onDrop = function(name) {
    var i = this.options.length;

    while(i--){
        var option = this.options[i];

        if(option.name == name){
            option.enabled = true;
        }else{
            option.enabled = false;
        }
    }

    this.entity.sound.play('Option');
    this.entity.fire('Timeline:Play');

    this.app.fire('EffectManager:LandSmoke', this.entity.getPosition());

    this.app.fire('Motion', 'LittleShake');
};