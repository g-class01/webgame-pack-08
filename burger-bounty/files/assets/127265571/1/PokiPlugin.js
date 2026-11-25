var PokiPlugin = {
    adblock : false,
    adInProgress : false,
    isPaused : false,
    //Set true when the player explicitly hits the pause button (or showReward
    //triggers pauseGame for an ad). Distinct from `isPaused`/`timeScale===0`
    //because popups also zero timeScale to freeze gameplay, but should NOT
    //block popup-internal Button presses. Button._firePress reads this flag
    //(not timeScale) to decide whether to suppress world-button clicks.
    isExplicitlyPaused : false,
    canShowAds : false,
    isGamePaused : true,
    isAlreadyLoaded : false,
    gameplayStartFail : false,
    isGameplayActive : false,
    hasFiredFirstGameplay : false,

    //After a non-popup rewardedBreak ends we hold pauseGame's frozen state
    //(timeScale=0 + audio mute) instead of auto-resuming. The next window-level
    //click/touch/keydown calls tryPostAdResume → playGame, which is what fires
    //PokiSDK.gameplayStart. Prevents the auto-firing-after-ad pattern Poki
    //review flagged previously and that players notice as "world starts moving
    //without me clicking anywhere."
    awaitingPostAdResume : false,

    //Centralized gameplay-state guard. Every PokiSDK.gameplayStart/Stop call funnels through
    //these two methods so we never fire the same transition twice (e.g. a Stop after a Stop),
    //which Poki flags. Single source of truth: `isGameplayActive`.
    startGameplay : function(){
        if(this.adInProgress){
            console.log('[POKI] gameplayStart skipped — ad in progress');
            return;
        }
        if(this.isGameplayActive){
            console.log('[POKI] gameplayStart skipped — already active');
            return;
        }
        //Defense-in-depth: never tell the SDK gameplay started while a popup is open.
        //Popup-close goes through tryCommercialBreak → callback(startGameplay), so the
        //legitimate post-popup start lands AFTER pc.hasActivePopup flips back to false.
        if(typeof pc !== 'undefined' && pc.hasActivePopup){
            console.log('[POKI] gameplayStart skipped — popup is open');
            return;
        }

        var sdkCalled = false;

        if(typeof PokiSDK !== 'undefined'){
            try{
                PokiSDK.gameplayStart();
                console.log('[POKI] gameplayStart');
                sdkCalled = true;
            }catch(e){
                this.gameplayStartFail = true;
            }
        }else{
            this.gameplayStartFail = true;
        }

        if(sdkCalled){
            this.gameplayStartFail = false;
            this.isGameplayActive  = true;
            this.lastGameplayStart = Date.now();
        }

        setTimeout(function(){
            pc.app.fire('PokiSDK:GameplayStart');
        }, 100);
    },
    stopGameplay : function(){
        if(!this.isGameplayActive){
            console.log('[POKI] gameplayStop skipped — already inactive');
            return;
        }

        if(typeof PokiSDK !== 'undefined'){
            PokiSDK.gameplayStop();
            console.log('[POKI] gameplayStop');
        }

        this.isGameplayActive = false;
    },

    init : function(){
        if(window.admob){
            PokiPlugin.onLoad();
            return false;
        }

        var isMobile = Utils.getURLParam('isMobile');

        if(isMobile){
            console.log('It works in mobile application wrapper, PokiSDK wont be working');

            return false;
        }

        var style = document.createElement('style');
        style.innerHTML = '#application-console{ display:none; }'
        document.head.appendChild(style);

        var script = document.createElement('script');
        script.src = 'poki-sdk.js';
        script.onload = function(){
            PokiPlugin.onLoad();
        };

        document.head.append(script);
    },
    onLoad : function(){
        PokiSDK.init({ volume: 0.35 }).then(function(){
            console.log('PokiSDK Loaded!');
            PokiPlugin.loadCompleted();
            PokiPlugin.canShowAds = true;
        }).catch(function(){
            PokiPlugin.adblock = true;
            PokiPlugin.loadCompleted();
            console.log('Initialized, but the user likely has adblock');
        });
    },
    loadCompleted : function(){
        if(this.isAlreadyLoaded){
            return false;
        }

        //requested to fire after load complete
        PokiSDK.gameLoadingFinished();

        if(!this.isGameplayActive && this.gameplayStartFail){
            PokiPlugin.startGameplay();
        }

        this.isAlreadyLoaded = true;
    },
    onPause : function(){
        if(this.isGamePaused){
            return false;
        }

        PokiPlugin.stopGameplay();

        this.isGamePaused = true;
        console.log('[EVENT] Game paused!');
    },
    pauseGame : function(){
        if(typeof pc !== 'undefined'){
            pc.app.timeScale = 0;
            PokiPlugin.isPaused = true;
            //isExplicitlyPaused tracks the player-driven pause (or ad-driven
            //pauseGame) and is what Button._firePress reads. Popups freeze
            //gameplay too, but never set this — so popup buttons keep firing.
            PokiPlugin.isExplicitlyPaused = true;

            if(pc.app.systems && pc.app.systems.sound){
                pc.app.systems.sound.volume = 0;
            }

            pc.app.fire('Player:Stop');
            pc.app.fire('Gameplay:Pause');
        }

        PokiPlugin.onPause();
    },
    onPlay : function(){
        if(!this.isGamePaused){
            return false;
        }

        PokiPlugin.startGameplay();

        this.isGamePaused = false;

        console.log('[EVENT] Game play!');
    },
    firstGameplayEvent : function(){
        //Window-level click/touch/keydown listeners (bottom of file) call this on every
        //input to bootstrap Poki's "player has started playing" signal. Without these
        //guards, every click that closed gameplay (e.g. popup-open's stopGameplay) gets
        //immediately undone when the same click bubbles to window — producing the
        //gameplayStop→gameplayStart blip that Poki review flagged. Fire exactly once,
        //and never fire while a popup is up.
        if(this.hasFiredFirstGameplay) return;
        if(typeof pc !== 'undefined' && pc.hasActivePopup) return;
        this.hasFiredFirstGameplay = true;
        PokiPlugin.startGameplay();
        this.isGamePaused = false;
    },
    playGame : function(){
        //playGame is the only legitimate path that fully restores gameplay state,
        //so consume any pending post-ad resume gate here. Anything that calls
        //playGame (post-ad path, manual resume button, popup-close commercialBreak
        //callback) implicitly satisfies the "user has signaled resume" requirement.
        PokiPlugin.awaitingPostAdResume = false;

        if(typeof pc !== 'undefined'){
            //Always clear explicit-pause: an ad finished or the player tapped
            //resume. Popup-pause is a separate layer (anim freeze +
            //hasActivePopup gates) handled by onPopupOpen/Close.
            PokiPlugin.isExplicitlyPaused = false;

            pc.app.timeScale = 1;
            PokiPlugin.isPaused = false;

            if(pc.app.systems && pc.app.systems.sound){
                pc.app.systems.sound.volume = 0.5;
            }

            pc.app.fire('Gameplay:Play');
        }

        PokiPlugin.onPlay();
    },
    showReward : function(callback, options){
        if(PokiPlugin.adblock){
            if(typeof pc !== 'undefined'){
                pc.app.fire('Overlay:Adblock');
            }
            
            return false;
        }

        if(!PokiPlugin.canShowAds){
            if(typeof pc !== 'undefined'){
                pc.app.fire('Overlay:Adblock');
            }
            return false;
        }

        if(options && options.disableEvents){
            //events disabled
            console.log('Events disabled');
        }else{
            PokiPlugin.pauseGame();
        }

        //Block any stray startGameplay() calls (window-level click/touch/keydown
        //listeners feed firstGameplayEvent → startGameplay) from firing during the
        //ad. Cleared at the very top of .then() so playGame()'s post-ad startGameplay
        //runs normally. .catch() clears too so a rejected promise never strands it.
        PokiPlugin.adInProgress = true;

        PokiSDK.rewardedBreak().
        then(function(success){
            PokiPlugin.adInProgress = false;

            if(success){
                callback(success);
            }

            if(options && options.disableEvents){
                console.log('Events disabled');
                //events disabled
                return;
            }

            if(typeof pc !== 'undefined' && pc.hasActivePopup){
                //Reward ad fired from inside an open popup (StationUpgrades, etc.).
                //The popup-pause architecture (hasActivePopup gates, _frozenAnims,
                //_pausedTweens, TweenManager monkey-patch) keeps the world frozen
                //independently of timeScale — restore timeScale + audio so popup UI
                //keeps ticking. playGame's inner onPlay → startGameplay self-skips
                //on hasActivePopup, so this is safe; the popup-close path fires the
                //real startGameplay later (via tryCommercialBreak's callback).
                PokiPlugin.playGame();
            }else{
                //Non-popup reward ad (floating "+ad" button, daily-reward chain that
                //already closed its popup synchronously, etc.). Do NOT auto-resume —
                //Poki review flagged the auto-firing-startGameplay-after-ad pattern,
                //and players observe it as gameplay starting without any input.
                //Hold pauseGame's frozen state (timeScale=0, audio muted, isPaused).
                //The next window-level click/touch/keydown fires tryPostAdResume,
                //which calls playGame to do the full restore + startGameplay.
                PokiPlugin.awaitingPostAdResume = true;
            }
        }).catch(function(err){
            PokiPlugin.adInProgress = false;
            console.warn('[POKI] rewardedBreak rejected', err);
            if(!(options && options.disableEvents)){
                PokiPlugin.playGame();
            }
        });

        //global event
        pc.app.fire('PokiSDK:RewardedBreak');
    },
    onPopupOpen : function(playerEntity){
        //listener for `pc.app.fire('Popup:Open', playerEntity)`. Selective freeze:
        // 1. Tell Poki the player isn't playing (stopGameplay).
        // 2. Lock movement input.
        // 3. Set pc.hasActivePopup so dt-driven gates throughout the codebase
        //    short-circuit (Customer.update, TimerPolyfill, CustomerManager,
        //    Station, Movement, Collisions, Chef, Waiter, Waitress, PathMove
        //    all check it).
        // 4. Pause character anim/animation component playback by zeroing each
        //    component's `.speed` (snapshotted for restore). This freezes the
        //    customer patience-bar fill, walking/idle/eating loops, and worker
        //    animations WITHOUT touching pc.app.timeScale — so popup UI
        //    scripts, the Timer polyfill (when callers re-fire UI refreshes),
        //    text updates, and button input all keep working.
        //We deliberately do NOT touch pc.app.timeScale: that froze every
        //prototype.update body (including UI refreshers like StationUpgrades'
        //cost label) and broke the popup experience.
        PokiPlugin.stopGameplay();

        if(playerEntity && playerEntity.script && playerEntity.script.movement){
            playerEntity.script.movement.isLocked = true;
        }

        //Set true on open / false on close — no counting. A counted flag drifts
        //if Open ever fires without a matching Close (e.g. duplicate event firing
        //from synthesized touch+mouse events) and gets stuck blocking the controller.
        pc.hasActivePopup = true;

        PokiPlugin._freezeAnims();
        PokiPlugin._pauseTweens();
    },
    onPopupClose : function(playerEntity){
        //listener for `pc.app.fire('Popup:Close', playerEntity)`. Mirrors onPopupOpen, plus
        //attempts a commercialBreak. gameplayStart fires via the tryCommercialBreak callback
        //so it lands AFTER the ad if one was shown.
        if(playerEntity && playerEntity.script && playerEntity.script.movement){
            playerEntity.script.movement.isLocked = false;
        }

        pc.hasActivePopup = false;

        PokiPlugin._restoreAnims();
        PokiPlugin._resumeTweens();

        PokiPlugin.tryCommercialBreak(function(){
            PokiPlugin.startGameplay();
        });
    },
    _pausedTweens : null,
    _pauseTweens : function(){
        //Defensive belt-and-suspenders alongside the TweenManager prototype
        //patch: walk pc.app._tweenManager._tweens and call .pause() on every
        //playing one. PC's Tween.update returns early when !this.playing, so
        //any future TweenManager.update tick (if the prototype patch missed
        //or fires before the popup flag flips) still no-ops on each tween.
        //Stash the list so onPopupClose can resume only the ones we paused
        //(don't resume tweens the player started during the popup, which is
        //rare but possible).
        if(typeof pc === 'undefined' || !pc.app || !pc.app._tweenManager) return;
        if(PokiPlugin._pausedTweens) return;

        var tweens = pc.app._tweenManager._tweens;
        var paused = [];
        for(var i = 0; i < tweens.length; i++){
            var t = tweens[i];
            if(t && t.playing){
                t.pause();
                paused.push(t);
            }
        }
        PokiPlugin._pausedTweens = paused;
    },
    _resumeTweens : function(){
        if(!PokiPlugin._pausedTweens) return;
        var paused = PokiPlugin._pausedTweens;
        for(var i = 0; i < paused.length; i++){
            //Tween may have completed/stopped while popup was up if anything
            //touched it; resume() is a no-op then.
            if(paused[i] && typeof paused[i].resume === 'function'){
                paused[i].resume();
            }
        }
        PokiPlugin._pausedTweens = null;
    },
    _frozenAnims : null,
    _freezeAnims : function(){
        //Snapshot every anim/animation component's playback speed and zero it.
        //Anim/animation components tick on a dt-scaled internal clock; setting
        //speed=0 freezes the playhead without touching pc.app.timeScale, so
        //popup UI scripts and dt-based UI refreshers keep ticking.
        if(typeof pc === 'undefined' || !pc.app || !pc.app.root) return;

        //Bail if a previous open's snapshot wasn't restored (defensive — should
        //not happen because Popup:Open/Close are paired by PopupManager).
        if(PokiPlugin._frozenAnims) return;

        var snapshot = [];
        var anims = pc.app.root.findComponents('anim');
        for(var i = 0; i < anims.length; i++){
            snapshot.push({ comp: anims[i], speed: anims[i].speed });
            anims[i].speed = 0;
        }
        var legacy = pc.app.root.findComponents('animation');
        for(var j = 0; j < legacy.length; j++){
            snapshot.push({ comp: legacy[j], speed: legacy[j].speed });
            legacy[j].speed = 0;
        }
        PokiPlugin._frozenAnims = snapshot;
    },
    _restoreAnims : function(){
        if(!PokiPlugin._frozenAnims) return;
        var snapshot = PokiPlugin._frozenAnims;
        for(var i = 0; i < snapshot.length; i++){
            //Component might have been destroyed mid-popup (e.g. customer
            //leaving). Skip those.
            if(snapshot[i].comp && snapshot[i].comp.entity){
                snapshot[i].comp.speed = snapshot[i].speed;
            }
        }
        PokiPlugin._frozenAnims = null;
    },
    bindPopupEvents : function(){
        //pc.app may not exist yet when DOMContentLoaded fires — poll briefly until it does,
        //then register both popup listeners. Any popup script firing 'Popup:Open'/'Popup:Close'
        //will route through the handlers above.
        if(typeof pc === 'undefined' || !pc.app){
            setTimeout(PokiPlugin.bindPopupEvents, 100);
            return;
        }

        PokiPlugin.patchTweenManager();
        pc.app.on('Popup:Open', PokiPlugin.onPopupOpen);
        pc.app.on('Popup:Close', PokiPlugin.onPopupClose);
    },
    _tweenPatched : false,
    patchTweenManager : function(){
        //One-shot monkey-patch on pc.TweenManager.prototype.update so every
        //active PlayCanvas tween freezes when a popup is open. Tweens drive
        //the customer patience bar (Timeline.js → entity.tween()), the
        //DealtDamage popup numbers, and any other entity.tween(...) call.
        //The TweenManager subscribes to pc.app's 'update' event with raw
        //dt, so without this gate tweens keep ticking under the menu while
        //their owning entities are otherwise frozen by the per-system
        //hasActivePopup gates. Tweens resume from the same .time on the
        //next frame after Popup:Close.
        if(PokiPlugin._tweenPatched) return;
        if(typeof pc === 'undefined' || !pc.TweenManager) return;

        var origUpdate = pc.TweenManager.prototype.update;
        pc.TweenManager.prototype.update = function(dt){
            if(typeof pc !== 'undefined' && pc.hasActivePopup){
                return;
            }
            return origUpdate.call(this, dt);
        };
        PokiPlugin._tweenPatched = true;
    },
    tryPostAdResume : function(){
        //Called from every window-level click/touch/keydown listener. Acts only
        //when a non-popup rewardedBreak is awaiting user input to resume.
        //Cheap early-out so we don't churn on every touchmove during gameplay.
        if(!PokiPlugin.awaitingPostAdResume) return;
        if(PokiPlugin.adInProgress) return;
        //If a popup opened during the ad-end interval (synchronous popup-open
        //inside the ad's resolve callback chain — unusual but possible),
        //skip resume; popup-close path will fire startGameplay. Leave the flag
        //set so a later non-popup click can resume if popup-close also gets
        //skipped for some reason.
        if(typeof pc !== 'undefined' && pc.hasActivePopup) return;
        PokiPlugin.playGame();
    },
    tryCommercialBreak : function(callback){
        //fire-and-forget interstitial. No cooldown — every popup-close fires an ad attempt
        //(SDK itself decides whether to actually serve). Callback (optional) runs after the
        //ad finishes or immediately if we skipped this attempt due to adblock / SDK not ready.
        if(PokiPlugin.adblock || typeof PokiSDK === 'undefined' || !PokiPlugin.canShowAds){
            if(callback) callback();
            return;
        }

        //snapshot prior timeScale/volume so we restore exactly what was in effect — important
        //if the player happened to be in the explicit pause state when the ad started
        var prevTimeScale = (typeof pc !== 'undefined') ? pc.app.timeScale : 1;
        var prevVolume = (typeof pc !== 'undefined' && pc.app.systems && pc.app.systems.sound)
            ? pc.app.systems.sound.volume
            : 0.5;

        if(typeof pc !== 'undefined'){
            pc.app.timeScale = 0;
            if(pc.app.systems && pc.app.systems.sound){
                pc.app.systems.sound.volume = 0;
            }
        }

        //Same guard as showReward — block startGameplay during the ad. Cleared
        //before the popup-close callback (which calls startGameplay) so the
        //post-ad start runs as intended.
        PokiPlugin.adInProgress = true;

        PokiSDK.commercialBreak().then(function(){
            PokiPlugin.adInProgress = false;

            if(typeof pc !== 'undefined'){
                pc.app.timeScale = prevTimeScale;
                if(pc.app.systems && pc.app.systems.sound){
                    pc.app.systems.sound.volume = prevVolume;
                }
                pc.app.fire('PokiSDK:CommercialBreak');
            }

            if(callback) callback();
        }).catch(function(err){
            PokiPlugin.adInProgress = false;
            console.warn('[POKI] commercialBreak rejected', err);
            if(typeof pc !== 'undefined'){
                pc.app.timeScale = prevTimeScale;
                if(pc.app.systems && pc.app.systems.sound){
                    pc.app.systems.sound.volume = prevVolume;
                }
            }
            if(callback) callback();
        });
    }
};

//dom loaded
document.addEventListener('DOMContentLoaded', function() {
    PokiPlugin.init();
    PokiPlugin.bindPopupEvents();
});

window.addEventListener('keydown', function(ev){
    PokiPlugin.firstGameplayEvent();
    PokiPlugin.tryPostAdResume();

    if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
        ev.preventDefault();
    }
});

window.addEventListener('wheel', function(ev){
    ev.preventDefault()
}, { passive: false });

//also trigger first gameplay on click
window.addEventListener('click', function(ev){
    PokiPlugin.firstGameplayEvent();
    PokiPlugin.tryPostAdResume();
});

window.addEventListener('touchstart', function(ev){
    PokiPlugin.firstGameplayEvent();
    PokiPlugin.tryPostAdResume();
});

window.addEventListener('touchmove', function(ev){
    PokiPlugin.firstGameplayEvent();
    PokiPlugin.tryPostAdResume();
});

window.addEventListener('touchend', function(ev){
    PokiPlugin.firstGameplayEvent();
    PokiPlugin.tryPostAdResume();
});

/*window.addEventListener('mousemove', function(ev){
    PokiPlugin.firstGameplayEvent();
});*/

//disable context
window.addEventListener('contextmenu', function(ev){
    ev.preventDefault();

    PokiPlugin.firstGameplayEvent();
    PokiPlugin.tryPostAdResume();
});