// SS1.0 - set est weight to blank on inventory item record when copied
// Robert Bender for SDMayer client: North Berkeley Wine 

//client script to run on new item initialization when record is copied
function item_init(type){
    // when created from copy the field should init blank
    if (type=='copy'){
        nlapiSetFieldValue('custitem72', '' );
    }
}