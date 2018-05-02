function set_bill_approver(name){
    if (name == 'custbody_sdm_bill_approver'){
        nlapiSetFieldValue('nextapprover', nlapiGetFieldValue('custbody_sdm_bill_approver') );        
    }
}