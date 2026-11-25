var Garbage = pc.createScript('garbage');

Garbage.attributes.add('garbageBinEntity', { type : 'entity' });
Garbage.prototype.initialize = function() {
    this.entity.on('Trigger', this.onTrigger, this);
};

Garbage.prototype.onTrigger = function(entity) {
    if(!entity){
        return false;
    }

    //weird session function
    if(!pc.carriedGarbageBefore){
        pc.carriedGarbageBefore = true;

        Timer.setTimeout(function(self){
            self.app.fire('Camera:Focus', self.garbageBinEntity);
        }, 1500, this);
    }
};