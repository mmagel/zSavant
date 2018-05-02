function so_after_submit(type){
	//&&nlapiGetContext().getExecutionContext()=='csvimport'
	nlapiLogExecution('ERROR','sss',nlapiGetContext().getExecutionContext())
	if (type=='create'){
		var rec=nlapiTransformRecord('salesorder',nlapiGetRecordId(),'invoice');
		nlapiSubmitRecord(rec);
	}
}