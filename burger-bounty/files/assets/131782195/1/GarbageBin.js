var GarbageBin = pc.createScript('garbageBin');

GarbageBin.prototype.initialize = function() {
    this.lastDrop = -1;
    this.entity.on('Trigger', this.onTrigger, this);

    this.app.fire('Scene:Triggers');
};

GarbageBin.prototype.onTrigger = function(entity) {
    if(entity){
        if(
            Date.now() - this.lastDrop > 100 && 
            (
                entity.script.carries.hasAnyCarry() ||
                entity.script.carries.hasCarryByName('Garbage')
            )
        ){
            this.app.fire('Throw', 'Garbage', 1200);
            this.entity.sound.play('Whoosh');

            entity.fire('Drop', 'Garbage');
            entity.fire('Drop', 'Burger');
            entity.fire('Drop', 'Fries');
            entity.fire('Drop', 'IceCream');
            entity.fire('Drop', 'Coke');
            entity.fire('Drop', 'DirtyPlate');

            entity.fire('Drop', 'Sushi');
            entity.fire('Drop', 'Ramen');

            entity.fire('Drop', 'PizzaCheese');
            entity.fire('Drop', 'PizzaMozzarella');

            this.lastDrop = Date.now();
        }

        entity.fire('Trigger:Reset');
    }
};