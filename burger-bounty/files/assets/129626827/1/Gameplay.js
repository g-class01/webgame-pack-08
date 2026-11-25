var Gameplay = pc.createScript('gameplay');

//add pause and play entity attributes
Gameplay.attributes.add('pauseEntity', { type : 'entity' });
Gameplay.attributes.add('playEntity', { type : 'entity' });
Gameplay.attributes.add('lightEntity', { type : 'entity' });
Gameplay.attributes.add('resetPopupEntity', { type : 'entity' });
Gameplay.attributes.add('transitionEntity', { type : 'entity' });
Gameplay.prototype.initialize = function() {
    if(window.navigator.language){
        this.app.i18n.locale = this.app.i18n.findAvailableLocale(window.navigator.language);
    }

    this.isPaused = false;
    this.transitionEntity.enabled = true;

    //cache the player entity so PokiPlugin.onPopupOpen/Close can lock movement.
    //Gameplay.js has no playerEntity script attribute; this avoids needing an editor change.
    this.playerEntity = this.app.root.findByName('Player');

    Utils.addEvent('game_start');

    this.app.on('Gameplay:Pause', this.onPause, this);
    this.app.on('Gameplay:Play', this.onPlay, this);

    this.app.on('Gameplay:PausePlay', this.onPausePlay, this);
    this.app.on('Gameplay:Reset', this.onReset, this);
    this.app.on('Gameplay:ShowResetPopup', this.showResetPopup, this);
};

Gameplay.prototype.showResetPopup = function() {
    this.resetPopupEntity.enabled = true;
    this.app.fire('Popup:Open', this.playerEntity);
};

Gameplay.prototype.onReset = function() {
    if(window.ResetHandler && window.ResetHandler.reset){
        window.ResetHandler.reset();
        return;
    }

    //fallback: page-reload reset if ResetHandler isn't loaded
    window.localStorage.clear();
    window.location.reload();
};

Gameplay.prototype.onPausePlay = function() {
    if(!this.isPaused){
        PokiPlugin.pauseGame();
    }else{
        PokiPlugin.playGame();
    }
};

Gameplay.prototype.onPause = function() {
    this.isPaused = true;

    //disable and enable play pause entities
    this.pauseEntity.enabled = !this.isPaused;
    this.playEntity.enabled = this.isPaused;
};

Gameplay.prototype.onPlay = function() {
    this.isPaused = false;

    //disable and enable play pause entities
    this.pauseEntity.enabled = !this.isPaused;
    this.playEntity.enabled = this.isPaused;
};

Gameplay.prototype.update = function() {
    /*if(this.app.keyboard.wasPressed(pc.KEY_P)){
        this.onPausePlay();
    }*/
};