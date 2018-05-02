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
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 5991059);    // abandonded cart escalation manager
                    break;
                case 4:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 5991060);    // PK Safety Supply Calibration & Repair escalation manager
                    break;
                case 1:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 5991061);    // PK Safety Supply Customer Service
                    break;
                case 5:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 5991062);    // Escalation Group - Quotes Territory
                    break;
                case 3:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 5991063);    // Escalation Group - Sales Support Territory
                    break;
                default:
                    nlapiSetCurrentLineItemValue( 'escalateto' , 'escalatee' , 5990348);    // anything else = Case Escalation Managers Group
                    nlapiLogExecution('ERROR','err','chose default escalation group');
                    
                    break;
            }
            nlapiCommitLineItem('escalateto');
            return true;
        }
    }

}


   //assign sales rep as assigned
function assignsalesrep{
    try
    {
        var cust = nlapiGetFieldValue('company');
        var custrep = nlapiLookupField('customer',cust,'salesrep');
        if (custrep != ''){
            nlapiSetFieldValue('assigned',custrep);
        }
    }catch(e)
    {
        nlapiLogExecution('DEBUG','salesrep',' old status='+status+' type='+type+' cust='+cust+' custrep='+custrep+' err='+e.message);
    }
}


        //nlapiLogExecution('DEBUG','salesrep',' old status='+status+' type='+type);
    
    



