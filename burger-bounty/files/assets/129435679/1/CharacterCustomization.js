var CharacterCustomization = pc.createScript('characterCustomization');

CharacterCustomization.attributes.add('renderEntity', { type : 'entity' });
CharacterCustomization.attributes.add('materials', { type : 'asset', array : true });
CharacterCustomization.prototype.initialize = function() {
    this.gender = 'Male';
    this.materialIndex = {
        'Male' : [2, 3, 1, 4],
        'Female' : [1, 4, 2, 3]
    };

    this.currentMaterialIndexes = ["1", "3", "4", "4"];

    var characterGender = Utils.getItem('CharacterGender');
    var materialIndexes = Utils.getItem('CharacterCustomizationMaterial');

    if(materialIndexes){
        if(characterGender){
            this.gender = characterGender;
        }

        try{
            this.currentMaterialIndexes = JSON.parse(materialIndexes);
        }catch(e){

        }
    }

    this.updateAllMaterialIndexes();

    this.app.on('CharacterCustomization:Tshirt', this.setTshirtColor, this);
    this.app.on('CharacterCustomization:Pant', this.setPantsColor, this);
    this.app.on('CharacterCustomization:Shoes', this.setShoesColor, this);
    this.app.on('CharacterCustomization:Hair', this.setHairColor, this);
    this.app.on('CharacterCustomization:Gender', this.setGender, this);
};

CharacterCustomization.prototype.setGender = function(gender) {
    this.renderEntity.render.asset = this.app.assets.find('Chef-' + gender);
    this.gender = gender;

    this.updateAllMaterialIndexes();
    this.saveMaterialIndexes();
};

CharacterCustomization.prototype.setShoesColor = function(colorIndex) {
    if(this.renderEntity.render.meshInstances.length > 0){
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][2]].material = this.materials[parseInt(colorIndex)].resource;
        this.currentMaterialIndexes[2] = colorIndex;

        this.saveMaterialIndexes();
    }
};

CharacterCustomization.prototype.setTshirtColor = function(colorIndex) {
    if(this.renderEntity.render.meshInstances.length > 0){
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][0]].material = this.materials[parseInt(colorIndex)].resource;
        this.currentMaterialIndexes[0] = colorIndex;
    }
};

CharacterCustomization.prototype.setPantsColor = function(colorIndex) {
    if(this.renderEntity.render.meshInstances.length > 0){
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][1]].material = this.materials[parseInt(colorIndex)].resource;
        this.currentMaterialIndexes[1] = colorIndex;

        this.saveMaterialIndexes();
    }
};

CharacterCustomization.prototype.setHairColor = function(colorIndex) {
    if(this.renderEntity.render.meshInstances.length > 0){
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][3]].material = this.materials[parseInt(colorIndex)].resource;
        this.currentMaterialIndexes[3] = colorIndex;

        this.saveMaterialIndexes();
    }
};

CharacterCustomization.prototype.saveMaterialIndexes = function(){
    Utils.setItem('CharacterCustomizationMaterial', JSON.stringify(this.currentMaterialIndexes));
    Utils.setItem('CharacterGender', this.gender);
};

CharacterCustomization.prototype.updateAllMaterialIndexes = function(){
    //update with array
    if(this.renderEntity.render.meshInstances.length > 0){
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][0]].material = this.materials[this.currentMaterialIndexes[0]].resource;
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][1]].material = this.materials[this.currentMaterialIndexes[1]].resource;
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][2]].material = this.materials[this.currentMaterialIndexes[2]].resource;
        this.renderEntity.render.meshInstances[this.materialIndex[this.gender][3]].material = this.materials[this.currentMaterialIndexes[3]].resource;
    }

};