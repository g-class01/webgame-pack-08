var Time = pc.createScript('time');

Time.attributes.add('start', { 
    type : 'number',
    default : 0
});

Time.attributes.add('direction', { 
    type : 'string',
    default : 'Forward',
    enum : [
        { 'Forward' : 'Forward' },
        { 'Backward' : 'Backward' }
    ]
});

Time.attributes.add('startEvent', { 
    type : 'string'
});

Time.attributes.add('endEvent', { 
    type : 'string'
});

Time.prototype.initialize = function() {
    this.startEventTriggered = false;
    this.endEventTriggered   = false;

    this.time = parseFloat(this.start + '');

    this.on('state', this.onStateChange, this);

    if(this.startEvent && !this.startEventTriggered){
        this.app.fire(this.startEvent);
        this.startEventTriggered = true;
    }
};

Time.prototype.onStateChange = function() {
    this.startEventTriggered = false;
    this.endEventTriggered   = false;

    this.time = parseFloat(this.start + '');
};

Time.prototype.update = function(dt) {
    if(this.direction == 'Forward'){
        this.time+=dt;
    }else{
        this.time-=dt;
    }

    if(this.direction == 'Backward'){
        if(this.endEvent && this.time <= 0 && !this.endEventTriggered){
            this.app.fire(this.endEvent);
            this.endEventTriggered = true;
        }
    }
    
    this.entity.element.text = Utils.mmss(this.time);
};