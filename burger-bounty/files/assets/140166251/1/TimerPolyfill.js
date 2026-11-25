var Timer = {
    nextTimerId: 0,
    timers: [],
    init: function(){
        pc.app.on('update', this.onUpdate, this);
    },
    //Default setTimeout: NOT pausable. Survives popup-open so UI-side
    //delayed callbacks (StationUpgrades' renderUpgrades 100ms after a buy,
    //showRequest, doorbell, etc.) keep firing while a menu is up.
    setTimeout: function(callback, time, arg1, arg2, arg3){
        var timer = {
            id: this.nextTimerId++,
            callback: callback,
            timeLeft: time / 1000,
            args: [arg1, arg2, arg3],
            pausable: false
        };

        this.timers.push(timer);

        return timer.id;
    },
    //Pausable setTimeout: skipped while pc.hasActivePopup is true, resumes
    //ticking when the popup closes. Use for gameplay countdowns that should
    //freeze with the menu — customer eat/finishEating/sadLeave timers, etc.
    setTimeoutPausable: function(callback, time, arg1, arg2, arg3){
        var id = this.setTimeout(callback, time, arg1, arg2, arg3);
        //Mark the timer just pushed as pausable.
        this.timers[this.timers.length - 1].pausable = true;
        return id;
    },
    clearTimeout: function(timerId){
        for (var i = 0; i < this.timers.length; i++) {
            if (this.timers[i].id === timerId) {
                this.timers.splice(i, 1);
                break;
            }
        }
    },
    onUpdate: function(dt){
        var popupOpen = (typeof pc !== 'undefined' && pc.hasActivePopup);

        for (var i = this.timers.length - 1; i >= 0; i--){
            //Skip pausable timers while a popup is open; they resume from the
            //same timeLeft when the popup closes.
            if(popupOpen && this.timers[i].pausable){
                continue;
            }

            this.timers[i].timeLeft -= dt;
            if (this.timers[i].timeLeft <= 0){
                this.timers[i].callback.apply(null, this.timers[i].args);
                this.timers.splice(i, 1);
            }
        }
    }
};

// Initialize Timer
Timer.init();