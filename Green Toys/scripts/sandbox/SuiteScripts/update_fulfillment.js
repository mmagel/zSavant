function update_date(recType,recId){
	try {
		var update_fields=nlapiLookupField(recType,recId,['custrecord_int_id','custrecord_tran_date','custrecord_acct_period']);
		var fulf=nlapiLoadRecord('itemfulfillment',update_fields.custrecord_int_id);
		fulf.setFieldValue('postingperiod',update_fields.custrecord_acct_period);
		fulf.setFieldValue('trandate',update_fields.custrecord_tran_date);
		nlapiSubmitRecord(fulf);
	}
	catch(e){
		nlapiLogExecution('ERROR','update fulf error',recId+' '+e.message);
	}
}