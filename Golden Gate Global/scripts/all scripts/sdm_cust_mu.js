function check_next_steps_deadline(recType,recId){
	var cust=nlapiLoadRecord(recType,recId);
	var lead1=cust.getFieldValue('custentity213');
	var lead2=cust.getFieldValue('custentity214');
	if (lead2==null||lead2=='')
		nlapiSendEmail(1102,lead1,'Next steps deadline in two days- '
				+cust.getFieldValue('companyname'),'Next Steps: '+cust.getFieldValue('custentity_sdm_next_steps')+'\n Deadline: '+cust.getFieldValue('custentity_next_steps_deadline'));
	else 
		nlapiSendEmail(1102,[nlapiLookupField('employee',lead1,'email'),nlapiLookupField('employee',lead2,'email')],'Next steps deadline in two days- '
				+cust.getFieldValue('companyname'),'Next Steps: '+cust.getFieldValue('custentity_sdm_next_steps')+'\n Deadline: '+cust.getFieldValue('custentity_next_steps_deadline'));
}