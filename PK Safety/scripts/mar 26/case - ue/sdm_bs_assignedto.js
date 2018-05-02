function bs_assignrep(type,status){
    //var id = nlapiGetRecordId();
    nlapiLogExecution('DEBUG','salesrep start','status='+status+' type='+type);
    if (type == 'create'){
        try
        {
            //get the orgin if it's manual or email
            var origin = nlapiGetFieldValue('origin');  // 1 = email
            var assigned = nlapiGetFieldValue('assigned');

            if (origin == 1){   // created via email
                var cust = nlapiGetFieldValue('company');
                var custrec = nlapiLoadRecord('customer', cust);
                var custtype = custrec.getRecordType();
                if (custtype == 'customer'){
                    var custrep = nlapiLookupField('customer',cust,'salesrep');
                    var iscustrepsales = nlapiLookupField('employee',custrep,'issalesrep');
                    var iscustrepsupport = nlapiLookupField('employee',custrep,'issupportrep');
                    if ((assigned == '' || assigned == null) && iscustrepsupport == 'T'){
                        nlapiSetFieldValue('assigned',custrep);
                        nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
                    }
                }
                // send email to rep too?
            }
            else // origin anything other than email (ex: manual thru the UI)
            {
                var cust = nlapiGetFieldValue('company');
                var custrec = nlapiLoadRecord('customer', cust);
                var custtype = custrec.getRecordType();
                if (custtype == 'customer'){
                    var custrep = nlapiLookupField('customer',cust,'salesrep');
                    var iscustrepsales = nlapiLookupField('employee',custrep,'issalesrep');
                    var iscustrepsupport = nlapiLookupField('employee',custrep,'issupportrep');
                    if ((assigned == '' || assigned == null) && iscustrepsupport == 'T'){
                        nlapiSetFieldValue('assigned',custrep);
                        nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
                    }
                }
            }


            //assign sales rep if they are makred as support rep
            function assign_sales_rep(){
                var cust = nlapiGetFieldValue('company');
                var custrec = nlapiLoadRecord('customer', cust);
                var custtype = custrec.getRecordType();
                if (custtype == 'customer'){
                    var custrep = nlapiLookupField('customer',cust,'salesrep');
                    var iscustrepsales = nlapiLookupField('employee',custrep,'issalesrep');
                    var iscustrepsupport = nlapiLookupField('employee',custrep,'issupportrep');
                    if ((assigned == '' || assigned == null) && iscustrepsupport == 'T'){
                        nlapiSetFieldValue('assigned',custrep);
                        nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
                    }
                }
            }


            //nlapiSubmitRecord(rec);

        }
        catch(e)
        {
            nlapiLogExecution('DEBUG','salesrep-catch',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep+' err='+e.message);
        }
    } else if (type == 'edit' || type == 'xedit'){  // upon edit

    }


}