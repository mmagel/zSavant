// before submit
// set the next approver as the custbody_sdm_bill_approver
function update_next_approver(){
    nlapiLogExecution('DEBUG','start', nlapiGetFieldValue('nextapprover') );
    nlapiSetFieldValue('nextapprover', nlapiGetFieldValue('custbody_sdm_bill_approver') );
    nlapiLogExecution('DEBUG','end', nlapiGetFieldValue('nextapprover') );
}