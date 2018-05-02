   //assign sales rep as assigned
function assignsalesrep(type,status){
    var id = nlapiGetRecordId();
    nlapiLogExecution('DEBUG','salesrep start','status='+status+' type='+type+ ' id='+id);
    if (type == 'create'){
        try
        {
            var rec = nlapiLoadRecord('supportcase',id);

            var cust = rec.nlapiGetFieldValue('company');
            var custrep = rec.nlapiLookupField('customer',cust,'salesrep');
            if (custrep != '' || custrep != null){
                rec.nlapiSetFieldValue('assigned',custrep);
            }
            nlapiSubmitRecord(rec);
        }
        catch(e)
        {
            nlapiLogExecution('DEBUG','salesrep',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep+' err='+e.message);
        }
    }

}




// cases.1024898_3.76eae57a13@cases.sandbox.netsuite.com

function cs_assignrep(type,status){
    //var id = nlapiGetRecordId();
    nlapiLogExecution('DEBUG','salesrep start','status='+status+' type='+type);
    if (type == 'create'){
        try
        {
            //var rec = nlapiLoadRecord('supportcase',id);

            var cust = nlapiGetFieldValue('company');
            var custrep = nlapiLookupField('customer',cust,'salesrep');
            if (custrep != '' || custrep != null){
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
 