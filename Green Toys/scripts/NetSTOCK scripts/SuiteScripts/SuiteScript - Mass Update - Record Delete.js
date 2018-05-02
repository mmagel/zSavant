function mass_update(recordType,internalId){
//	var current = nlapiGetRecordId(recordType,internalId);
//		current.setFieldValue('custevent_sdm_project_task_closed','T')
		var id = nlapiDeleteRecord(recordType, internalId);
	//var rec=nlapiLoadRecord(recordType,internalId,{recordmode:'dynamic'});
	//rec.setFieldText('shipstatus','Shipped');
	//rec.setFieldValue('shippeddate','1/1/2016');
	//rec.setFieldValue('trandate','1/1/2016');
   // nlapiSubmitRecord(rec);
		}
		