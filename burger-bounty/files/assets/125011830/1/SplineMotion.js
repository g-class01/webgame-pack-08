var SplineMotion = pc.createScript('splineMotion');

SplineMotion.attributes.add('speed', { type : 'number', default : 1.0 });
SplineMotion.attributes.add('tension', { type : 'number', default : 1.0 });
SplineMotion.prototype.initialize = function() {
    this.animations = [];

    this.points = this.entity.findByTag('Point');
    this.hidePoints();

    this.app.on('SplineMotion:' + this.entity.name, this.play, this);
    this.on('destroy', this.onDestroy);
};

SplineMotion.prototype.hidePoints = function() {
    for(var index in this.points){
        var point = this.points[index];
        var position = point.getPosition().clone();

        point.enabled = false;
    }
};

SplineMotion.prototype.onDestroy = function() {
    this.app.off('SplineMotion:' + this.entity.name, this.play, this);
};

SplineMotion.prototype.generateCurves = function() {
    var curve = {
        timestamp : 0,
        isPlaying : true
    };

    curve.curveX = new pc.Curve();
    curve.curveY = new pc.Curve();
    curve.curveZ = new pc.Curve();

    curve.curveX.type = pc.CURVE_SPLINE;
    curve.curveY.type = pc.CURVE_SPLINE;
    curve.curveZ.type = pc.CURVE_SPLINE;

    curve.curveX.tension = this.tension;
    curve.curveY.tension = this.tension;
    curve.curveZ.tension = this.tension;

    for(var index in this.points){
        var point = this.points[index];
        var time  = parseInt(index) / this.points.length;
        var position = point.getPosition().clone();

        curve.curveX.add(time, position.x);
        curve.curveY.add(time, position.y);
        curve.curveZ.add(time, position.z);

        point.enabled = false;
    }

    curve.firstPosition = this.points[0].getPosition().clone();

    return curve;
};

SplineMotion.prototype.play = function(entity, position, rotation) {
    if(this.points.length === 0){
        console.error('No point tags found in spline motion!');
        return false;
    }

    if(!entity){
        console.error('First arg should be an entity!');
        return false;
    }

    if(entity.curve){
        return false;
    }

    this.visualEntity = entity;

    /*
    this.entity.setPosition(position);
    this.entity.setEulerAngles(rotation);
    */

    this.visualEntity.curve = this.generateCurves();
    //this.visualEntity.setPosition(this.visualEntity.curve.firstPosition);

    this.animations.push(this.visualEntity);
};

SplineMotion.prototype.update = function(dt) {
    for(var index in this.animations){
        var animation = this.animations[index];

        if(animation.curve.isPlaying){
            var pointX = animation.curve.curveX.value(
                animation.curve.timestamp
            );

            var pointY = animation.curve.curveY.value(
                animation.curve.timestamp
            );

            var pointZ = animation.curve.curveZ.value(
                animation.curve.timestamp
            );

            animation.setPosition(
                pointX, pointY, pointZ
            );

            animation.curve.timestamp+=dt * this.speed;

            if(animation.curve.timestamp >= 1.0){
                animation.curve.isPlaying = false;
                animation.curve = false;

                this.animations.splice(
                    this.animations.indexOf(animation),
                    1
                );
            }
        }
    }
};