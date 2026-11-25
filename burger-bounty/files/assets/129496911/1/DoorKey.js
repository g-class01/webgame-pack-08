var DoorKey = pc.createScript('doorKey');

DoorKey.attributes.add('doorEntity1', { type : 'entity' });
DoorKey.attributes.add('doorEntity2', { type : 'entity' });
DoorKey.prototype.initialize = function() {
    this.doorEntity1.fire('Activate');
    this.doorEntity2.fire('Activate');
};