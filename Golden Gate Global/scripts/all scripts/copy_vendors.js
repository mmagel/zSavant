function copy_vendor(recType,recId){
	var rec=nlapiCopyRecord(recType,recId);
	var rec2=nlapiCopyRecord(recType,recId);
	var name=nlapiLookupField(recType,recId,'entityid');
	
	if (name.charAt(name.length-1)==')'){
		
		var leftparen=name.lastIndexOf('(');
		name=name.slice(0,leftparen);
		name=name.trim();
	}

		rec.setFieldValue('entityid',name+' (VI)');
		rec2.setFieldValue('entityid',name+' (VIII)');

	//string.replac("\\(.*?\\)","");
	
	rec.setFieldValue('subsidiary',6);
	rec2.setFieldValue('subsidiary',10);
	try {
		nlapiSubmitRecord(rec);
		nlapiSubmitRecord(rec2);
		nlapiSubmitField(recType,recId,'custentity_copy_fail_reason','');
	}
	catch (e){
		nlapiLogExecution('ERROR','error '+recId,e.message);
		nlapiSubmitField(recType,recId,'custentity_copy_fail_reason',e.message);
	}
}