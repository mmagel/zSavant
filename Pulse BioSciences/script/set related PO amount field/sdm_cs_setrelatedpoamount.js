function set_related_po_amount(name){
    nlapiLogExecution('DEBUG', 'name', name);
    if (name == 'custbody2'){
        nlapiSetFieldValue( 'custbody3',  nlapiLookupField('purchaseorder', nlapiGetFieldValue('custbody2'), 'amount') );        
    }
}