var StateTime = pc.createScript('stateTime');

StateTime.attributes.add('timeline', {
    type : 'json',
    schema : [
        {
            name : 'name',
            type : 'string',
            default : 'Default'
        },
        {
            name : 'time',
            type : 'number',
            default : 0
        },
        {
            name : 'enable',
            type : 'entity',
            array : true
        },
        {
            name : 'disable',
            type : 'entity',
            array : true
        }
    ],
    array : true
});

StateTime.prototype.initialize = function() {
    this.timeouts = [];
    this.currentState = 'None';

    this.app.on('StateTime:' + this.entity.name, this.onPlay, this);
    this.onPlay('Default');
};

StateTime.prototype.onPlay = function(name) {
    if(this.currentState == name){
        return false;
    }

    for(var timeoutIndex in this.timeouts){
        clearTimeout(this.timeouts[timeoutIndex]);
    }

    this.timeouts = [];

    for(var index in this.timeline){
        var timeline = this.timeline[index];

        if(timeline.name == name){
            var timeout = setTimeout(function(timeline){
                for(var enableIndex in timeline.enable){
                    var enableEntity = timeline.enable[enableIndex];

                    enableEntity.enabled = true;
                }

                for(var disableIndex in timeline.disable){
                    var disableEntity = timeline.disable[disableIndex];

                    disableEntity.enabled = false;
                }
            }, timeline.time * 1000, timeline);

            this.timeouts.push(timeout);
        }
    }

    this.currentState = name;
};