var TrashBin = pc.createScript('trashBin');

TrashBin.attributes.add('particleEntity', { type : 'entity' });
TrashBin.prototype.initialize = function() {
    this.lastDrop = -1;
    this.entity.on('Trigger', this.onTrigger, this);

    this.app.fire('Scene:Triggers');
};

TrashBin.prototype.onTrigger = function(entity) {
    if(entity){
        if(
            Date.now() - this.lastDrop > 1000 && 
            entity.script.carries.hasAnyCarry()
        ){
            this.app.fire('TrashBin', entity.name);

            //play wash and whoosh sounds
            this.entity.sound.play('Wash');
            this.entity.sound.play('Whoosh');
            this.entity.sound.play('Sink');

            this.app.fire('Motion', 'Sink');

            this.particleEntity.enabled = true;

            Timer.setTimeout(function(self){
                self.particleEntity.enabled = false;
            }, 3000, this);

            this.lastDrop = Date.now();
        }

        entity.fire('Drop', 'Burger');
        entity.fire('Drop', 'Fries');
        entity.fire('Drop', 'DirtyPlate');
        entity.fire('Drop', 'Coke');
        entity.fire('Drop', 'IceCream');
        
        entity.fire('Drop', 'Sushi');
        entity.fire('Drop', 'Ramen');

        entity.fire('Drop', 'PizzaCheese');
        entity.fire('Drop', 'PizzaMozzarella');

        entity.fire('Trigger:Reset');
    }
};