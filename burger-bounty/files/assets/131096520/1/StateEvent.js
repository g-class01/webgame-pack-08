var StateEvent = pc.createScript('stateEvent');

StateEvent.attributes.add('events', {
    type : 'json',
    schema : [
        {
            name : 'eventName',
            type : 'string'
        },
        {
            name : 'eventValue',
            type : 'string'
        },
        {
            name : 'arg1',
            type : 'string'
        }
    ],
    array : true
});

StateEvent.prototype.initialize = function() {
    this.events.forEach(function(e){
        pc.app.fire(e.eventName, e.eventValue, e.arg1);
    }, this);
};