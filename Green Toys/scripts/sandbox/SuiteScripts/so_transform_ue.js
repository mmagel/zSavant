function so_after_submit(type){
try {
	if ((type=='create'||type=='edit')&&nlapiGetContext().getExecutionContext()=='csvimport'){
		var rec=nlapiTransformRecord('salesorder',nlapiGetRecordId(),'itemfulfillment');
		rec.setFieldText('shipstatus','Shipped');
                rec.setFieldValue('trandate',nlapiGetFieldValue('custbody_temp_invoicedate'));
		nlapiSubmitRecord(rec);
		var rec2=nlapiTransformRecord('salesorder',nlapiGetRecordId(),'invoice');
		//nlapiGetFieldValue('externalid')
		rec2.setFieldValue('tranid',nlapiGetFieldValue('custbody_temp_invoicenumber'));
		rec2.setFieldValue('trandate',nlapiGetFieldValue('custbody_temp_invoicedate'));
		nlapiSubmitRecord(rec2);
	}
}
catch(e){
	nlapiLogExecution('ERROR',nlapiGetRecordId(),e.message);
}
}