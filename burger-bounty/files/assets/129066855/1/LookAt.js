var LookAt = pc.createScript('lookAt');

LookAt.attributes.add('lookEntity', { type : 'entity' });
LookAt.prototype.initialize = function() {

};

LookAt.prototype.update = function(dt) {
    if(this.lookEntity){
        this.entity.lookAt(this.lookEntity.getPosition());   
    }
};