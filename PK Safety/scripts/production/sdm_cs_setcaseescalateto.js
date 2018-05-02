// rbender@sdmayer.com for PK Safety 2/6/2018
// after status is chosen then run this function
// set escalation managers case group

function caseescalated(type, name){
    if (name == 'status'){
        status = parseInt( nlapiGetFieldValue('status') );
        var caseprofile = parseInt(nlapiGetFieldValue('profile'));
        if (status == 3){
            nlapiInsertLineItem('escalateto');
            switch (caseprofile) {
                case 6:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 6550715);    // abandonded cart escalation manager
                    break;
                case 4:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 6550719);    // PK Safety Supply Calibration & Repair escalation manager
                    break;
                case 1:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 6550720);    // PK Safety Supply Customer Service
                    break;
                case 5:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 6550722);    // Escalation Group - Quotes Territory
                    break;
                case 3:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 6550723);    // Escalation Group - Sales Support Territory
                    break;
                default:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 6550716);    // anything else = Case Escalation Managers Group
                    nlapiLogExecution('ERROR','err','chose default escalation group');
                    break;
            }
            nlapiCommitLineItem('escalateto');
            return true;
        }
    }

}


function cs_assignrep(){
    var id = nlapiGetRecordId();
    nlapiLogExecution('DEBUG','salesrep start','status='+status+' type='+type+ ' id='+id);
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
        }
        catch(e)
        {
            nlapiLogExecution('DEBUG','salesrep',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep+' err='+e.message);
        }
    }    
}


