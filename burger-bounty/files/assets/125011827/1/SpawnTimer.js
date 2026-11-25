var SpawnTimer = pc.createScript('spawnTimer');

SpawnTimer.attributes.add('nextSpawn', { type : 'number', default : 1 });
SpawnTimer.attributes.add('spawnEntity', { type : 'entity' });
SpawnTimer.attributes.add('timerEntity', { type : 'entity' });
SpawnTimer.prototype.initialize = function() {
    this.createTimerEntity();

    this.setNextAlarm();
};

SpawnTimer.prototype.createTimerEntity = function(){
    var timerEntity = this.timerEntity.clone();

    timerEntity.setPosition(this.entity.getPosition());
    timerEntity.enabled = true;

    this.app.root.addChild(timerEntity);

    this.alarmEntity = timerEntity.findByName('Alarm');
    this.alarmEntity.enabled = false;

    this.clockEntity = timerEntity.findByName('Clock');
    this.clockEntity.enabled = true;
};

SpawnTimer.prototype.setNextAlarm = function() {
    this.app.fire('Station:Clock');

    this.alarmEntity.enabled = false;
    this.clockEntity.enabled = true;

    Timer.setTimeout(function(self){
        self.spawn();
    }, this.nextSpawn * 1000, this);
};

SpawnTimer.prototype.spawn = function() {
    var self = this;
    var spawnEntity = this.spawnEntity.clone();

    spawnEntity.setPosition(
        this.entity.getPosition()
    );

    spawnEntity.setEulerAngles(0, Math.random() * 360, 0);
    spawnEntity.on('Collect', function(){
        self.setNextAlarm();
    });

    this.app.root.addChild(spawnEntity);
    this.app.fire('Scene:Collectables');
    this.app.fire('Station:Alarm');

    this.alarmEntity.enabled = true;
    this.clockEntity.enabled = false;
};