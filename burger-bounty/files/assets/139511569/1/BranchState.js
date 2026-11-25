var BranchState = pc.createScript('branchState');

BranchState.attributes.add('entities', { type : 'entity', array : true });
BranchState.prototype.initialize = function() {
    //enabled disable pc.CountryName name
    this.entities.forEach(function(entity) {
        entity.enabled = pc.CountryName == entity.name;
    });
};