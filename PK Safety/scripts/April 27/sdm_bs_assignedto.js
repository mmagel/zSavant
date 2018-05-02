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
                    var iscustrepinactive = nlapiLookupField('employee',custrep,'isinactive');
                    if ((assigned == '' || assigned == null) && iscustrepsupport == 'T' && iscustrepinactive != 'T' ){  // 3= Rick Pedley
                        nlapiSetFieldValue('assigned',custrep);
                        nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
                        // add code to email the sales rep here to notify them
                    }
                    if (custrep == 3){
                        nlapiSetFieldValue('profile',1);
                    }
                }
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
                    var iscustrepinactive = nlapiLookupField('employee',custrep,'isinactive');
                    if ((assigned == '' || assigned == null) && iscustrepsupport == 'T' && iscustrepinactive != 'T'  ){
                        nlapiSetFieldValue('assigned',custrep);
                        nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
                    }
                    if (custrep == 3){
                        nlapiSetFieldValue('profile',1);
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
                    var iscustrepinactive = nlapiLookupField('employee',custrep,'isinactive');
                    if ((custrep == '' || custrep == null) && iscustrepsupport == 'T' && iscustrepinactive != 'T'  ){
                        nlapiSetFieldValue('assigned',custrep);
                        nlapiLogExecution('DEBUG','salesrep-try',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep);
                    }
                    if (custrep == 3){
                        nlapiSetFieldValue('profile',1);
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