var Option = pc.createScript('option');

Option.attributes.add('action', { type : 'string' });
Option.attributes.add('value', { type : 'string' });
Option.attributes.add('checkEntity', { type : 'entity' });
Option.attributes.add('isChecked', { type : 'boolean', default : false });
Option.prototype.initialize = function() {
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('touchstart', this.onPress, this);

    //mouse hover
    this.entity.element.on('mouseenter', this.onHover, this);
    this.entity.element.on('mouseleave', this.onLeave, this);

    var checkState = Utils.getItem('Check_' + this.entity._guid);

    if(checkState){
        if(checkState == 'true'){
            this.setState(true);
        }else{
            this.setState(false); 
        }
    }else if(this.isChecked){
        this.setState(true);
    }else{
        this.checkEntity.enabled = false;
    }
};

Option.prototype.setState = function(state) {
    var self = this;
    var options = this.app.root.findByTag(this.entity.tags.list()[0]);
    
    options.forEach(function(optionEntity){
        if(self.entity != optionEntity){
            optionEntity.script.option.checkEntity.enabled = false;
            optionEntity.script.option.isChecked = false;
        }
    });

    this.isChecked = state;
    this.checkEntity.enabled = state;
    Utils.setItem('Check_' + this.entity._guid, state);

    this.app.fire(this.action, this.value);
};

Option.prototype.toggle = function() {
    this.isChecked = !this.isChecked;
    this.setState(this.isChecked);
};

Option.prototype.onHover = function() {
    document.body.style.cursor = 'pointer';
};

Option.prototype.onLeave = function() {
    document.body.style.cursor = 'default';
};

Option.prototype.onPress = function(dt) {
    this.toggle();
};