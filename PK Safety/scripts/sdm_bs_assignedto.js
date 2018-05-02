
function bs_assignrep(type,status){
    //var id = nlapiGetRecordId();
    nlapiLogExecution('DEBUG','salesrep start','status='+status+' type='+type);
    if (type == 'create'){
        try
        {
            //var rec = nlapiLoadRecord('supportcase',id);

            var cust = nlapiGetFieldValue('company');
            var custrep = nlapiLookupField('customer',cust,'salesrep');
            var profile = nlapiGetFieldValue('profile') // 6 = abandoned cart
            if (custrep != '' || custrep != null && profile != "6"){    
                nlapiSetFieldValue('assigned',custrep);
            }
            //nlapiSubmitRecord(rec);
            nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
        }
        catch(e)
        {
            nlapiLogExecution('DEBUG','salesrep-catch',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep+' err='+e.message);
        }
    }    
}