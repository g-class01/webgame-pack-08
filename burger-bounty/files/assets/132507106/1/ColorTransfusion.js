var ColorTransfusion = pc.createScript('colorTransfusion');

ColorTransfusion.attributes.add('colorCurve', { type: 'curve', color: 'rgb', default: {
    keys: [
        [ 0, 0.5, 0.5, 1, 1, 0 ],
        [ 0, 0, 0.5, 0.5, 1, 1 ],
        [ 0, 1, 0.5, 0, 1, 0.5 ]
    ]
}});

ColorTransfusion.attributes.add('time', {type : 'number', default : 1});
ColorTransfusion.attributes.add('loop', {type : 'boolean'});


ColorTransfusion.prototype.initialize = function() {
    this.timer = 0;
};

ColorTransfusion.prototype.update = function(dt) {
    //Halt the time-accumulator while a popup is open. This is the script
    //that drives the customer patience-bar color ramp (green→yellow→red)
    //by sampling colorCurve at this.timer; without this gate the bar's
    //tint keeps progressing under the menu even though the bar's
    //tween/scale is paused.
    if(pc.hasActivePopup){
        return;
    }

    this.timer += dt / this.time;

    var color = this.colorCurve.value(this.timer);

    this.entity.element.color = new pc.Color(color[0], color[1], color[2], color[3]);

    if(this.loop && this.timer >= 1){
        this.timer = 0;
    }
};