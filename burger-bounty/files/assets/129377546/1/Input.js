var Input = pc.createScript('input');

Input.attributes.add('placeholder', { type : 'string' });
Input.attributes.add('type', {
    type: 'string',
    enum: [
        { 'Text': 'text' },
        { 'Email': 'email' },
        { 'Password': 'password' }
    ],
    default : 'text'
});
Input.attributes.add('maxLength', { type : 'number', default : 64 });
Input.attributes.add('fontSize', { type : 'number', default : 1 });
Input.attributes.add('padding', { type : 'number', default : 1 });
Input.attributes.add('hasIcon', { type : 'boolean' });
Input.attributes.add('scaleUnit', {
    type: 'string',
    enum: [
        { 'Viewport Width': 'vw' },
        { 'Viewport Height': 'vh' },
        { 'Pixel': 'px' }
    ],
    default : 'vw'
});
Input.attributes.add('color', { type : 'rgb' });
Input.attributes.add('disableTab', { type : 'boolean' });
Input.attributes.add('whitePlaceholder', { type : 'boolean' });
Input.attributes.add('temporary', { type : 'boolean' });
Input.attributes.add('fontFamily', { type : 'string', default : 'Arial, sans-serif' });
Input.attributes.add('storeValue', { type : 'boolean' });

Input.attributes.add('containerEntity', { type : 'entity' });
Input.attributes.add('focusEntity', { type : 'entity' });
Input.attributes.add('sleepValue', { type : 'string' });
Input.attributes.add('blurFunction', { type : 'string' });
Input.attributes.add('key', { type : 'string' });

Input.prototype.initialize = function() {
    this.timeout = false;
    
    this.app.on('Input:' + this.entity.name, this.setValue, this);
    
    this.on('state', function(state){
        if(state){
            if(this.temporary){
                this.element.style.display = 'block';
            }else{
                this.createElement();
            }
        }else{
            if(this.temporary){
                this.element.style.display = 'none';
            }else{
                this.onDestroy();
            }
        }
    }, this);
    
    this.on('destroy', this.onDestroy, this);
    
    this.createElement();
};

Input.prototype.createElement = function(){
    this.currentWidth = 0;
    this.currentHeight = 0;
    
    this.isDestroyed = false;
    
    this.element = document.createElement('input');
    this.element.placeholder = this.placeholder;
    
    this.element.type = this.type;
    
    this.element.style.position = 'absolute';
    this.element.style.fontFamily = this.fontFamily;
    
    this.element.style.border = '0px';
    this.element.style.background = 'transparent';
    
    this.element.style.fontSize = this.fontSize + this.scaleUnit;
    this.element.style.padding = this.padding + this.scaleUnit;
    this.element.style.boxSizing = 'border-box';
    this.element.style.display   = 'block';
    
    if(this.hasIcon){
        this.element.style.paddingRight = '2.5vw';
    }
    
    if(this.disableTab){
        this.element.tabindex = false;
    }
    
    if(this.maxLength > 0){
        this.element.maxLength = this.maxLength;
    }
    
    var color = 'rgb(' + (this.color.r * 255) + ', ' + (this.color.g * 255) + ', ' + (this.color.b * 255) + ')';
    this.element.style.color = color;
    
    this.element.style.outline = 'none';
    
    if(this.whitePlaceholder){
        this.element.className = 'white-placeholder';
    }
    
    if(this.containerEntity){
        this.element.style.position = 'fixed';
        this.containerEntity.script.container.insideElement.appendChild(this.element);
    }else{
        document.body.appendChild(this.element);
    }
    
    //disable focus entity
    if(this.focusEntity){
        this.focusEntity.enabled = false;   
    }
    
    this.element.onfocus = this.onFocus.bind(this);
    this.element.onblur = this.onBlur.bind(this);
    
    if(this.blurFunction){
        this.element.onblur = this.onBlurFunction.bind(this);
    }
    
    this.element.onchange = this.onChange.bind(this);
    
    //if(this.storeValue){
        var value = Utils.getItem(this.entity._guid);
        
        if(value){
            this.setValue(Utils.getItem(this.entity._guid));   
        }
    //}
    
    this.updateStyle();
    
    this.app.on('DOM:Clear', this.onDOMClear, this);
    this.app.on('DOM:Update', this.onDomUpdate, this);
    this.app.on('Input:' + this.entity.name, this.setResultValue, this);
    
    if(this.sleepValue){
        this.setValue(this.sleepValue);
    }
};

Input.prototype.onBlurFunction = function(){
    var blurFunctions = this.blurFunction.split(', ');

    if(blurFunctions.length > 0){
        for(var blurIndex in blurFunctions){
            var blurFunction = blurFunctions[blurIndex];
            var parts = blurFunction.split('\@');
            var key   = parts[0];

            if(parts.length > 1){
                var value = parts[1];

                this.app.fire(key, value);
            }else{
                this.app.fire(key);
            }
        }
    }
};

Input.prototype.onDOMClear = function(){
    this.entity.destroy();  
};

Input.prototype.onDestroy = function(){
    this.app.off('DOM:Clear', this.onDOMClear, this);
    this.app.off('DOM:Update', this.onDomUpdate, this);
    this.app.off('Input:' + this.entity.name, this.setResultValue, this);

    this.isDestroyed = true;
    
    if(this.element){
        this.element.remove();
    }
    
    this.app.off('Input:' + this.entity.name, this.setValue, this);
};

Input.prototype.store = function() {
    this.storeValue = true;
    this.onChange();
};

Input.prototype.onFocus = function() {
    if(this.focusEntity){
        this.focusEntity.enabled = true;
    }
    
    this.app.fire('Input:Focus', true);
};

Input.prototype.onBlur = function() {
    if(this.focusEntity){
        this.focusEntity.enabled = false;
    }
    
    this.app.fire('Input:Focus', false);
};

Input.prototype.onChange = function() {
    if(this.storeValue){
        Utils.setItem(this.entity._guid, this.getValue());
    }
};

Input.prototype.onDomUpdate = function(){
    this._updateStyle();
};

Input.prototype.updateStyle = function() {
    if(
        this.currentWidth == window.innerWidth &&
        this.currentHeight == window.innerHeight
    ){
        return false;
    }
    
    this._updateStyle();
    
    this.currentWidth = window.innerWidth;
    this.currentHeight = window.innerHeight;
};

Input.prototype._updateStyle = function() {
    if(this.isDestroyed){
        return false;
    }
    
    var self = this;
    
    if(self.entity && self.entity.element && self.entity.element.screenCorners){
        var position = self.entity.element.screenCorners;
        var ratio = 1 / self.app.graphicsDevice.maxPixelRatio;
        var offsetLeft = 0;
        var offsetTop  = 0;
        
        var width  = (position[2].x - position[0].x) * ratio;
        var height = (position[2].y - position[0].y) * ratio;
        
        if(this.containerEntity){
            var scaleX = this.containerEntity.scaleX;
            var scaleY = this.containerEntity.scaleY;
            
            offsetLeft = (position[0].x - this.containerEntity.offsetLeft) / scaleX;
            offsetTop  = (
                position[0].y - 
                this.containerEntity.offsetTop
            ) / scaleY - height + 
                this.containerEntity.element.height;
            
            if(this.containerEntity && this.containerEntity.script.container.autoResize){
                this.element.style.transform = 'scale(' + (1 / scaleX) + ', ' + 
                    (1 / scaleY) + ')';
                this.element.style.transformOrigin = 'left bottom';
            }
        }else{
            offsetLeft = position[0].x;
            offsetTop  = position[0].y;
        }

        self.element.style.left   = offsetLeft * ratio + 'px';
        self.element.style.bottom = offsetTop * ratio + 'px';

        self.element.style.width = width + 'px';
        self.element.style.height = height + 'px';
    }
};

Input.prototype.setResultValue = function(data) {
    if(!data){
        return false;
    }
    
    if(!data.result){
        this.element.value = data;
        return false;
    }
    
    var value = data.result;
    
    if(!this.element){
        this.sleepValue = value;
    }else{
        this.element.value = value;
        this.sleepValue = false;
    }
};

Input.prototype.setValue = function(value) {
    if(this.key && value && value[this.key] && this.element){
        this.element.value = value[this.key];
        return false;
    }
    
    if(!this.element){
        this.sleepValue = value;
    }else if(typeof value == 'string' && this.element){
        this.element.value = value;
        this.sleepValue = false;
    }
};

Input.prototype.getValue = function() {
    if(this.element){
        return this.element.value;   
    }
};

Input.prototype.focus = function() {
    if(this.element){
        this.element.focus();
    }
};

Input.prototype.blur = function() {
    if(this.element){
        this.element.blur();
    }
};