var EffectManager = pc.createScript('effectManager');

EffectManager.attributes.add('splashEffect', { type : 'entity' });
EffectManager.attributes.add('splashSprite', { type : 'entity' });
EffectManager.attributes.add('waveEffect', { type : 'entity' });
EffectManager.attributes.add('landSmokeEffect', { type : 'entity' });
EffectManager.attributes.add('landSmokeSprite', { type : 'entity' });
EffectManager.attributes.add('unlockEffect', { type : 'entity' });
EffectManager.attributes.add('unlockSprite', { type : 'entity' });
EffectManager.prototype.initialize = function() {
    this.app.on('EffectManager:LandSmoke', this.playLandSmoke, this);
    this.app.on('EffectManager:Splash', this.playSplash, this);
    this.app.on('EffectManager:WoodDestroy', this.playWoodDestroy, this);
    this.app.on('EffectManager:Footstep', this.addFootstep, this);
    this.app.on('EffectManager:Unlock', this.playUnlockEffect, this);

    this.footstepIndex = 0;
    this.footsteps = this.entity.findByTag('Footstep');
};

EffectManager.prototype.addFootstep = function(footEntity) {
    this.footsteps[this.footstepIndex].setPosition(footEntity.getPosition().clone());
    this.footsteps[this.footstepIndex].setRotation(footEntity.getRotation().clone());

    this.footstepIndex++;

    if(this.footsteps.length - 1 < this.footstepIndex){
        this.footstepIndex = 0;
    }
};

EffectManager.prototype.playLandSmoke = function(position) {
    this.landSmokeEffect.setPosition(position);

    this.landSmokeSprite.sprite.stop();
    this.landSmokeSprite.sprite.play('Fire');
};

EffectManager.prototype.playUnlockEffect = function(position){
    this.unlockEffect.setPosition(position);

    this.unlockSprite.sprite.stop();
    this.unlockSprite.sprite.play('Fire');

    //play sound
    this.entity.sound.play('Unlock');
};

EffectManager.prototype.playSplash = function(position) {
    this.splashEffect.setPosition(position);

    this.splashSprite.sprite.stop();
    this.splashSprite.sprite.play('Fire');

    this.waveEffect.sprite.stop();
    this.waveEffect.sprite.play('Fire');
};

EffectManager.prototype.playWoodDestroy = function(position) {
    this.app.fire('BakedPhysics:WoodDestroy', position);
};