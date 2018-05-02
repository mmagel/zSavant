// SS1.0 - set est weight value on inventory item record
// Robert Bender for SDMayer client: North Berkeley Wine 
//here's the formula for what I'm trying to achieve via scripting:
//
//case {custitem6} 
//when 'Still' then {custitem11} * .004
//when 'Dessert' then {custitem11} * .004
//when 'Oil' then {custitem11} * .004
//when 'Sparkling' then {custitem11} * .0053 end
//
// BOTTLE SIZE - ML		custitem11
// CLASSIFICATION		custitem6
// EST. WEIGHT			custitem72


//user event script to run on inv item, on Save BEFORE SUBMIT
function item_bs(type){
    try{
        var itemrec = nlapiGetNewRecord();
        var classification = itemrec.getFieldText('custitem6');
        var mlbottle = Number(itemrec.getFieldText('custitem11'));
        var estweight = itemrec.getFieldValue('custitem72');

        // Whenever an inventory item record is Created/Edited and then Saved, the Est. Weight field will be recalculated based on the formula.
        if ((type=='create' || type=='edit') && (mlbottle!='' || mlbottle!=null) && (classification!='' || classification!=null) ){
            if ((classification == 'Still' || classification == 'Dessert' || classification == 'Oil') ){
                itemrec.setFieldValue('custitem72', (Math.round(mlbottle*.004)) );
            } else if (classification == 'Sparkling') {
                itemrec.setFieldValue('custitem72', (Math.round(mlbottle*.0053)) );
            } else {
                itemrec.setFieldValue('custitem72',null);
            }
           if( ((Math.round(mlbottle*.004))==0) || ((Math.round(mlbottle*.0053))==0) ){itemrec.setFieldValue('custitem72',null);}
        }
    } catch(e){
        nlapiLogExecution('ERROR','error',e.message);
    }
}
