var Rotate = pc.createScript('rotate');

Rotate.attributes.add('axis', {
    type: 'string',
    enum: [
        { 'x': 'x' },
        { 'y': 'y' },
        { 'z': 'z' }
    ]
});

Rotate.attributes.add('speed', { type : 'number' });
Rotate.attributes.add('waveStyle', { type : 'boolean' });
Rotate.attributes.add('waveWidth', { type : 'number' });
Rotate.attributes.add('children', { type : 'boolean' });
Rotate.attributes.add('graphName', { type : 'string' });

Rotate.prototype.initialize = function() {
    this.currentElement = this.entity;
    this.timestamp = 0;
    
    if(this.children){
        this.currentElement = this.entity.findByName(this.graphName);
    }
};

Rotate.prototype.update = function(dt) {
    var speed = this.speed * (dt * 60);
    
    if(this.waveStyle){
        speed = Math.cos(this.timestamp * this.speed) * this.waveWidth;
        this.timestamp+=(dt * 60);
    }
    
    if(this.currentElement){
        if(this.axis == 'x'){
            this.currentElement.rotateLocal(speed, 0, 0);
        }

        if(this.axis == 'y'){
            this.currentElement.rotateLocal(0, speed, 0);
        }

        if(this.axis == 'z'){
            this.currentElement.rotateLocal(0, 0, speed);
        }
    }else{
        if(this.children){
            this.currentElement = this.entity.findByName(this.graphName);
        }
    }
};