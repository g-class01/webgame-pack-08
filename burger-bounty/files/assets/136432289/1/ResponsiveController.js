var ResponsiveController = pc.createScript('responsiveController');

ResponsiveController.attributes.add('elements', {
    type : 'json',
    schema : [
        {
            name : 'desktop',
            type : 'entity'
        },
        {
            name : 'mobile',
            type : 'entity'
        }
    ],
    array : true
});
ResponsiveController.prototype.initialize = function() {
    for (var i = 0; i < this.elements.length; i++) {
        if (Utils.isMobile()) {
            if(this.elements[i].mobile){
                this.elements[i].mobile.enabled = true;
            }
            
            if(this.elements[i].desktop){
                this.elements[i].desktop.enabled = false;
            }
        } else {
            if(this.elements[i].mobile){
                this.elements[i].mobile.enabled = false;
            }

            if(this.elements[i].desktop){
                this.elements[i].desktop.enabled = true;
            }
        }
    }
};