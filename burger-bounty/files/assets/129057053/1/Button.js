var Button = pc.createScript('button');

Button.attributes.add('action', { type : 'string' });
Button.attributes.add('value', { type : 'string' });
Button.attributes.add('hitAnimation', { type : 'boolean', default : false });

//Mobile browsers fire touchstart and then synthesize a mousedown on the same element ~10-50ms
//later (same for touchend/mouseup). Without this dedupe, every tap fires onPress twice and
//doubles every app event the button dispatches (e.g. PokiSDK.gameplayStop ran twice per popup).
Button.MOUSE_SUPPRESS_MS = 300;

//Drag-cancel threshold (screen pixels). Pointer movement past this between press and release
//means the user was scrolling, not clicking — cancels the click so a ScrollView can drag freely
//without the upgrade button under the finger also firing. Squared to avoid sqrt in the hot path.
Button.DRAG_THRESHOLD_PX  = 8;
Button.DRAG_THRESHOLD_SQ  = Button.DRAG_THRESHOLD_PX * Button.DRAG_THRESHOLD_PX;

Button.prototype.initialize = function() {
    this.originalScale = this.entity.getLocalScale().clone();
    this._suppressMouseUntil = 0;
    this._pressed   = false;
    this._dragged   = false;
    this._startX    = 0;
    this._startY    = 0;

    this.entity.element.on('mousedown',   this.onMouseDown,   this);
    this.entity.element.on('mouseup',     this.onMouseUp,     this);
    this.entity.element.on('mousemove',   this.onMouseMove,   this);
    this.entity.element.on('touchstart',  this.onTouchStart,  this);
    this.entity.element.on('touchend',    this.onTouchEnd,    this);
    this.entity.element.on('touchmove',   this.onTouchMove,   this);
    this.entity.element.on('touchcancel', this.onTouchCancel, this);

    //mouse hover
    this.entity.element.on('mouseenter', this.onHover, this);
    this.entity.element.on('mouseleave', this.onLeave, this);
};

Button.prototype.onTouchStart = function(event) {
    this._suppressMouseUntil = Date.now() + Button.MOUSE_SUPPRESS_MS;
    this._beginPress(event);
};

Button.prototype.onMouseDown = function(event) {
    if(Date.now() < this._suppressMouseUntil) return;
    this._beginPress(event);
};

Button.prototype.onTouchMove = function(event) {
    if(!this._pressed || this._dragged) return;
    this._checkDragThreshold(event.x, event.y);
};

Button.prototype.onMouseMove = function(event) {
    if(!this._pressed || this._dragged) return;
    this._checkDragThreshold(event.x, event.y);
};

Button.prototype.onTouchEnd = function(event) {
    this._suppressMouseUntil = Date.now() + Button.MOUSE_SUPPRESS_MS;
    this._endPress(event);
};

Button.prototype.onMouseUp = function(event) {
    if(Date.now() < this._suppressMouseUntil) return;
    this._endPress(event);
};

Button.prototype.onTouchCancel = function() {
    this._cancelPress();
};

Button.prototype.onHover = function() {
    document.body.style.cursor = 'pointer';
};

Button.prototype.onLeave = function() {
    document.body.style.cursor = 'default';
    //Pointer left the button while pressed — treat as drag-off, so a release elsewhere
    //(or a re-enter + release) won't fire the action. Mirrors native button-click behavior.
    if(this._pressed && !this._dragged){
        this._dragged = true;
        this._restoreScale();
    }
};

Button.prototype._beginPress = function(event) {
    this._pressed = true;
    this._dragged = false;
    this._startX  = event.x;
    this._startY  = event.y;

    if(this.hitAnimation){
        this.entity.setLocalScale(this.originalScale.clone().scale(0.75));
    }
};

Button.prototype._checkDragThreshold = function(x, y) {
    var dx = x - this._startX;
    var dy = y - this._startY;
    if(dx * dx + dy * dy > Button.DRAG_THRESHOLD_SQ){
        this._dragged = true;
        this._restoreScale();
    }
};

Button.prototype._endPress = function(event) {
    this._restoreScale();

    var fire = this._pressed && !this._dragged;
    this._pressed = false;
    this._dragged = false;

    if(fire){
        this._firePress(event);
    }
};

Button.prototype._cancelPress = function() {
    this._restoreScale();
    this._pressed = false;
    this._dragged = false;
};

Button.prototype._restoreScale = function() {
    if(this.hitAnimation){
        this.entity.setLocalScale(this.originalScale);
    }
};

Button.prototype._firePress = function(event) {
    //Block world-button presses only while the explicit pause overlay is up.
    //We DO NOT gate on this.app.timeScale === 0 anymore: popups also zero
    //timeScale (so anim/Timer/dt-driven systems freeze), but popup-internal
    //buttons must keep firing or the player can't close the menu. The
    //isExplicitlyPaused flag, set inside PokiPlugin.pauseGame and cleared in
    //playGame, is the precise "block world buttons" signal — popups don't
    //touch it.
    if(typeof PokiPlugin !== 'undefined' && PokiPlugin.isExplicitlyPaused){
        return false;
    }

    this.app.fire(this.action, this.value, this.entity, event);
    this.entity.fire('Button:Press', this);

    pc.lastClickTime = Date.now();
};
