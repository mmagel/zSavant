function message_reassign(recType,recId){
	try {
	var rec=nlapiCopyRecord(recType,recId);
	var auth=rec.getFieldValue('author');
	var parent=nlapiSearchRecord('job',null,new nlobjSearchFilter('parent',null,'anyof',auth),new nlobjSearchColumn('internalid'));
	rec.setFieldValue('entity',parent[0].getValue('internalid'));
	nlapiLogExecution('ERROR','setauthor',parent[0].getValue('internalid')+' '+auth);
	nlapiSubmitRecord(rec);
	}
	catch (e){
		nlapiLogExecution('ERROR',auth,e.message);
	}
}//liu shunqing