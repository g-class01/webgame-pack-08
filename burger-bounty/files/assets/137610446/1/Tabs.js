var Tabs = pc.createScript('tabs');

Tabs.attributes.add('tabEntity', { type : 'entity' });
Tabs.attributes.add('tabs', { type : 'string', array : true });
Tabs.prototype.initialize = function() {
    this.tabEntities = [];
    this.tabEntity.enabled = false;

	for(var i = 0; i < this.tabs.length; i++) {
		var tab = this.tabEntity.clone();
		tab.script.button.value = this.tabs[i];
        tab.on('Button:Press', this.onButtonPress, this);

        tab.findByName('Text').element.text = this.tabs[i];
		tab.enabled = true;

		this.entity.addChild(tab);
        this.tabEntities.push(tab);
	}

    if(this.tabEntities.length > 0){
        this.onButtonPress(this.tabEntities[0].script.button);
    }
};

Tabs.prototype.onButtonPress = function(button) {
    //change opacities of this.tabEntities
	for(var i = 0; i < this.tabEntities.length; i++) {
        this.tabEntities[i].element.opacity = 0;
    }

    button.entity.element.opacity = 1;
};