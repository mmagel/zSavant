function bs_assignrep(type,status){
    //var id = nlapiGetRecordId();
    nlapiLogExecution('DEBUG','salesrep start','status='+status+' type='+type);
    if (type == 'create'){
        try
        {
            //var rec = nlapiLoadRecord('supportcase',id);

            var cust = nlapiGetFieldValue('company');
            var custrec = nlapiLoadRecord('customer', cust);
          	var custtype = custrec.getRecordType();
          	if (custtype == 'customer'){
                var custrep = nlapiLookupField('customer',cust,'salesrep');
                if (custrep != '' || custrep != null){
                    nlapiSetFieldValue('assigned',custrep);
                    nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
                }
            }

            //nlapiSubmitRecord(rec);

        }
        catch(e)
        {
            nlapiLogExecution('DEBUG','salesrep-catch',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep+' err='+e.message);
        }
    }    
}