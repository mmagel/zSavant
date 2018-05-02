// set est weight value on item client
//
//case {custitem6} 
//when 'Still' then {custitem11} * .004
//when 'Dessert' then {custitem11} * .004
//when 'Oil' then {custitem11} * .004
//when 'Sparkling' then {custitem11} * .0053 end
//

//client script to run on new item initialization
function item_init(type){
    var classification = nlapiGetFieldValue('custitem6');
    var mlbottle = nlapiGetFieldValue('custitem11');
    var estweight = nlapiGetFieldValue('custitem72');

    // when created from copy the field should init blank
    if (type=='copy'){
        nlapiSetFieldValue('custitem72', '' );
    }   
}

//user event script to run on save BEFORE SUBMIT
function item_bs(type){
    var itemrec = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId(),{recordmode: 'dynamic'});
    var classification = itemrec.getFieldValue('custitem6');
    var mlbottle = itemrec.getFieldValue('custitem11');
    var estweight = itemrec.getFieldValue('custitem72');

    //calculate est weight on create only
    if (type=='create' && (estweight==null||estweight=='') ){
        if (classification == 'Still' || classification == 'Dessert' || classification == 'Oil'){
            itemrec.setFieldValue('custitem72', (mlbottle*.004) );
        } else if (classification == 'Sparkling' ){
            itemrec.setFieldValue('custitem72', (mlbottle*.0053) );
        }
    }

    //if edit and theres no estweight value
    if (type=='edit' && (estweight==null||estweight=='') ){
        if (classification == 'Still' || classification == 'Dessert' || classification == 'Oil'){
            itemrec.setFieldValue('custitem72', (mlbottle*.004) );
        } else if (classification == 'Sparkling' ){
            itemrec.setFieldValue('custitem72', (mlbottle*.0053) );
        }
    }
nlapiSubmitRecord(itemrec);
}
